import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

// Allow large payloads for high-res classroom photos
app.use(express.json({ limit: '35mb' }));
app.use(express.urlencoded({ extended: true, limit: '35mb' }));

// Lazy initialization of Gemini AI
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      aiClient = new GoogleGenAI({ apiKey: key });
    }
  }
  return aiClient;
}

// Helper: fallback geometric analysis if AI is unavailable or fails
function generatePerspectiveBenches(
  benchesCount = 5,
  studentsPerBench = 3,
  perspectiveDesc = 'Calculated from teacher perspective view'
) {
  const benches: any[] = [];
  const seats: any[] = [];
  let seatIdCounter = 1;

  // Camera is at bottom-center or top-center (podium)
  // Teacher is at X: 400 (center), Y: 580 (front of classroom / camera view)
  const teacher = { x: 400, y: 580 };

  // Generate benches from front row (Row 1, closest to teacher) to back row (furthest)
  for (let r = 1; r <= benchesCount; r++) {
    // Row 1 is closest to teacher (y: ~480), Row N is back of the room (y: ~140)
    const t = (r - 1) / Math.max(1, benchesCount - 1);
    const rowY = Math.round(490 - t * 350); // 490 down to 140
    // Perspective trapezoid: back rows appear narrower or wider in classroom perspective
    const rowWidth = Math.round(540 - t * 60);
    const benchLeft = 400 - rowWidth / 2;
    const benchWidth = rowWidth;

    const rowSeats: any[] = [];
    for (let s = 1; s <= studentsPerBench; s++) {
      const seatT = studentsPerBench === 1 ? 0.5 : (s - 1) / (studentsPerBench - 1);
      const seatX = Math.round(benchLeft + 35 + seatT * (benchWidth - 70));
      const seatY = rowY;

      // Calculate distance to teacher
      const distToTeacher = Math.sqrt((seatX - teacher.x) ** 2 + (seatY - teacher.y) ** 2);
      const lateralDist = Math.abs(seatX - teacher.x);

      // Angle from center gaze
      const inCentralCone = lateralDist < 120;
      const isExtremeCorner = lateralDist > 190;

      // Safety calculation:
      // Front row (Row 1): High risk (distToTeacher is small, right in front of teacher)
      // Back row: High safety (further away, shielded by front heads)
      const distanceFactor = (r / benchesCount) * 45; // 9 to 45 pts
      const rowShielding = (r - 1) * 8; // Heads blocking view
      const angleProtection = isExtremeCorner ? 18 : inCentralCone ? -12 : 5;
      const cornerBonus = (seatX < 180 || seatX > 620) && r >= Math.floor(benchesCount / 2) ? 14 : 0;

      let safetyScore = Math.round(Math.min(99, Math.max(5, distanceFactor + rowShielding + angleProtection + cornerBonus + 12)));

      const isOccupied = Math.random() < 0.25; // Random occupancy for realism

      const positionLabel =
        s === 1
          ? 'Left Wing'
          : s === studentsPerBench
          ? 'Right Wing'
          : studentsPerBench === 3
          ? 'Center Slot'
          : `Slot #${s}`;

      const seatObj = {
        id: seatIdCounter,
        seat_id: seatIdCounter,
        benchId: r,
        rowNumber: r,
        positionIndex: s,
        x: seatX,
        y: seatY,
        label: `Row ${r} • Seat ${s} (${positionLabel})`,
        occupied: isOccupied,
        teacherSafetyScore: safetyScore,
        teacherGazeAngle: inCentralCone ? 'Direct Central Cone' : isExtremeCorner ? 'Far Blindspot' : 'Moderate Angle',
        distanceToTeacherPx: Math.round(distToTeacher),
        occlusionFactor: Math.min(100, Math.round((r - 1) * 22)),
        verdict:
          safetyScore > 85
            ? 'Stealth Master'
            : safetyScore > 70
            ? 'High Safety'
            : safetyScore > 45
            ? 'Moderate Risk'
            : 'Danger Zone',
        notes:
          r === 1 && inCentralCone
            ? "Directly in teacher's primary optical crosshairs."
            : r === benchesCount && isExtremeCorner
            ? "Maximum distance + extreme angle; teacher must turn head 60° to spot."
            : r > 2
            ? `Protected by ${r - 1} rows of student heads in front.`
            : 'Standard visibility.'
      };

      seats.push(seatObj);
      rowSeats.push(seatObj);
      seatIdCounter++;
    }

    const avgRowSafety = Math.round(rowSeats.reduce((acc, cur) => acc + cur.teacherSafetyScore, 0) / rowSeats.length);

    benches.push({
      benchId: r,
      rowNumber: r,
      label: r === 1 ? 'Front Row (Podium Contact)' : r === benchesCount ? 'Backbench Row (Max Cover)' : `Row ${r} Bench`,
      capacity: studentsPerBench,
      x: 400,
      y: rowY,
      width: benchWidth,
      height: 48,
      averageSafetyScore: avgRowSafety,
      seatIds: rowSeats.map(s => s.id),
      notes: r === 1 ? 'Immediate teacher eye contact' : `Row ${r} positioned with natural line-of-sight occlusion`
    });
  }

  // Sort seats by safety descending
  const sorted = [...seats].sort((a, b) => b.teacherSafetyScore - a.teacherSafetyScore);
  const rankedSeats = sorted.map((seat, idx) => ({
    ...seat,
    rank: idx + 1,
    medal: idx === 0 ? '👑 #1 Safest' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`
  }));

  const bestSeat = rankedSeats[0];
  const worstSeat = rankedSeats[rankedSeats.length - 1];

  return {
    detectedBenchesCount: benchesCount,
    studentsPerBench,
    totalCapacity: benchesCount * studentsPerBench,
    perspectiveAnalysis: perspectiveDesc,
    benches,
    seats: rankedSeats,
    bestSeat: {
      seat_id: bestSeat.id,
      label: bestSeat.label,
      benchRow: bestSeat.rowNumber,
      safetyScore: bestSeat.teacherSafetyScore,
      tacticalReasoning: `Located in Row ${bestSeat.rowNumber} (${bestSeat.label}). Maximizes distance from teacher's lectern, utilizes ${bestSeat.rowNumber - 1} rows of student heads as visual cover, and sits in the teacher's peripheral blindspot.`
    },
    worstSeat: {
      seat_id: worstSeat.id,
      label: worstSeat.label,
      benchRow: worstSeat.rowNumber,
      safetyScore: worstSeat.teacherSafetyScore,
      tacticalReasoning: `Located in Row ${worstSeat.rowNumber} directly in front of the teacher. High probability of eye contact, instant question targeting, and zero visual cover.`
    }
  };
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// API: Analyze Classroom Photo from Teacher's Point of View
app.post('/api/analyze-classroom', async (req, res) => {
  try {
    const { imageBase64, imagePath, studentsPerBench = 3, forcedBenches } = req.body;

    let base64Data = '';
    let mimeType = 'image/jpeg';

    if (imageBase64) {
      if (imageBase64.startsWith('data:')) {
        const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          mimeType = matches[1];
          base64Data = matches[2];
        } else {
          base64Data = imageBase64.split(',')[1] || imageBase64;
        }
      } else {
        base64Data = imageBase64;
      }
    } else if (imagePath) {
      // Load image from public or data folder
      const cleanPath = imagePath.replace(/^\//, '');
      const possiblePaths = [
        path.join(process.cwd(), 'public', cleanPath),
        path.join(process.cwd(), cleanPath),
        path.join(process.cwd(), 'data', cleanPath)
      ];

      for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
          const buffer = fs.readFileSync(p);
          base64Data = buffer.toString('base64');
          if (p.endsWith('.png')) mimeType = 'image/png';
          if (p.endsWith('.webp')) mimeType = 'image/webp';
          break;
        }
      }
    }

    const ai = getAIClient();

    // If no AI client or no image provided, return mathematical fallback
    if (!ai || !base64Data) {
      const fallback = generatePerspectiveBenches(
        forcedBenches || 5,
        studentsPerBench,
        'Analyzed using geometric perspective modeling from teacher lectern coordinate.'
      );
      return res.json({
        success: true,
        source: 'geometric_engine',
        data: fallback
      });
    }

    // Call Gemini 3.8 Flash Vision Model
    const prompt = `You are an AI spatial computer vision system for classroom ergonomics and teacher point-of-view (POV) perspective analysis.
Analyze this classroom photograph. Assume the photo was taken from the TEACHER'S POINT OF VIEW (standing at the teacher podium/blackboard at the front, looking across the student seating rows).

Your objectives:
1. Estimate the number of benches or desk rows visible in this image${forcedBenches ? ` (Target roughly ${forcedBenches} benches if visible)` : ''}.
2. Determine how many students are reasonably allowed per bench (capacity, typically 2, 3, or 4). If not obvious, default to ${studentsPerBench}.
3. Map the benches from front row (closest to teacher, Row 1) to the back row (Row N).
4. Evaluate teacher safety for each seating position:
   - Front benches have direct line-of-sight and maximum eye contact risk (Safety: 5% - 30%).
   - Middle benches have moderate line-of-sight with partial head occlusion (Safety: 40% - 70%).
   - Back benches and far corners have maximum stealth, blindspot coverage, and student occlusion (Safety: 75% - 98%).
5. Identify the absolute best seat for stealth and safety from the teacher, with tactical reasoning.

Return ONLY valid JSON matching this structure:
{
  "detectedBenchesCount": number,
  "studentsPerBench": number,
  "perspectiveAnalysis": "Detailed description of the teacher POV perspective, room depth, and sightlines",
  "benches": [
    {
      "benchId": number,
      "rowNumber": number,
      "label": "string like 'Front Row - Left' or 'Row 3 Center'",
      "capacity": number,
      "yCoordPercent": number,
      "safetyRating": number,
      "notes": "string"
    }
  ],
  "bestSeat": {
    "benchRow": number,
    "position": "string description e.g. Back Row, Far Left Corner",
    "safetyScore": number,
    "tacticalReasoning": "string with witty & tactical explanation"
  },
  "worstSeat": {
    "benchRow": number,
    "position": "string description e.g. Front Row Center",
    "safetyScore": number,
    "tacticalReasoning": "string explaining why this is death row"
  }
}`;

    try {
      const geminiResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            parts: [
              { inlineData: { mimeType, data: base64Data } },
              { text: prompt }
            ]
          }
        ],
        config: {
          responseMimeType: 'application/json'
        }
      });

      const responseText = geminiResponse.text;
      if (!responseText) {
        throw new Error('Empty response from Gemini');
      }

      const parsed = JSON.parse(responseText);

      // Now generate the full detailed seat array using the AI's detected bench layout
      const detectedBenches = parsed.detectedBenchesCount || forcedBenches || 5;
      const detectedCapacity = parsed.studentsPerBench || studentsPerBench || 3;

      // Enhance with computed spatial coordinates and safety scores
      const result = generatePerspectiveBenches(
        detectedBenches,
        detectedCapacity,
        parsed.perspectiveAnalysis || 'AI Teacher POV Vision Analysis completed'
      );

      // Integrate Gemini's reasoning into the generated result
      if (parsed.bestSeat?.tacticalReasoning) {
        result.bestSeat.tacticalReasoning = parsed.bestSeat.tacticalReasoning;
      }
      if (parsed.worstSeat?.tacticalReasoning) {
        result.worstSeat.tacticalReasoning = parsed.worstSeat.tacticalReasoning;
      }

      return res.json({
        success: true,
        source: 'gemini_vision_ai',
        data: result
      });
    } catch (aiErr: any) {
      console.warn('Gemini vision API error, falling back to geometric engine:', aiErr?.message || 'Unknown API Error');
      const fallback = generatePerspectiveBenches(
        forcedBenches || 5,
        studentsPerBench,
        'Analyzed with geometric POV perspective algorithms (teacher gaze vector).'
      );
      return res.json({
        success: true,
        source: 'geometric_engine_fallback',
        data: fallback
      });
    }
  } catch (error: any) {
    console.error('Server error in /api/analyze-classroom:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

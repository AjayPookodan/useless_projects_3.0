import { AnalysisResult, BenchData, ClassroomData, ScoredSeat, Seat } from '../types';

export function generateClientPerspectiveBenches(
  benchesCount = 5,
  studentsPerBench = 3,
  perspectiveDesc = 'Analyzed from teacher point of view (front podium/camera position)'
): AnalysisResult {
  const benches: BenchData[] = [];
  const seats: ScoredSeat[] = [];
  let seatIdCounter = 1;

  // Teacher camera POV origin at front center
  const teacher = { x: 400, y: 580 };

  for (let r = 1; r <= benchesCount; r++) {
    const t = (r - 1) / Math.max(1, benchesCount - 1);
    // Row 1 is closest to teacher/camera (y: ~480), Row N is back of room (y: ~140)
    const rowY = Math.round(490 - t * 350);
    const rowWidth = Math.round(560 - t * 60);
    const benchLeft = 400 - rowWidth / 2;

    const rowSeats: ScoredSeat[] = [];
    for (let s = 1; s <= studentsPerBench; s++) {
      const seatT = studentsPerBench === 1 ? 0.5 : (s - 1) / (studentsPerBench - 1);
      const seatX = Math.round(benchLeft + 35 + seatT * (rowWidth - 70));
      const seatY = rowY;

      const distToTeacher = Math.sqrt((seatX - teacher.x) ** 2 + (seatY - teacher.y) ** 2);
      const lateralDist = Math.abs(seatX - teacher.x);
      const inCentralCone = lateralDist < 120;
      const isExtremeCorner = lateralDist > 190;

      // Teacher POV safety metrics
      const distanceFactor = (r / benchesCount) * 45;
      const rowShielding = (r - 1) * 8.5;
      const angleProtection = isExtremeCorner ? 18 : inCentralCone ? -14 : 6;
      const cornerBonus = (seatX < 180 || seatX > 620) && r >= Math.floor(benchesCount / 2) ? 15 : 0;

      const safetyScore = Math.round(
        Math.min(99, Math.max(4, distanceFactor + rowShielding + angleProtection + cornerBonus + 10))
      );

      const isOccupied = Math.random() < 0.22;

      const positionLabel =
        s === 1
          ? 'Left Wing'
          : s === studentsPerBench
          ? 'Right Wing'
          : studentsPerBench === 3
          ? 'Center Slot'
          : `Slot #${s}`;

      const phoneSafety = Math.round(Math.min(99, safetyScore * 0.95 + (r - 1) * 3));
      const sleepPotential = Math.round(Math.min(99, safetyScore * 0.9 + (isExtremeCorner ? 12 : 0)));
      const questionRisk = Math.round(Math.max(3, 100 - safetyScore));

      const seatObj: ScoredSeat = {
        seat_id: seatIdCounter,
        x: seatX,
        y: seatY,
        label: `Row ${r} • Seat ${s} (${positionLabel})`,
        occupied: isOccupied,
        final_score: safetyScore,
        rank: 0,
        verdict:
          safetyScore >= 88
            ? 'Stealth Master'
            : safetyScore >= 70
            ? 'High Safety'
            : safetyScore >= 45
            ? 'Moderate Risk'
            : 'Danger Zone',
        medal: '',
        personality:
          safetyScore >= 88
            ? 'The Ghost Backbencher'
            : safetyScore >= 70
            ? 'Stealth Strategist'
            : safetyScore >= 45
            ? 'Casual Observer'
            : 'Front-Row Martyr',
        benchId: r,
        rowNumber: r,
        positionIndex: s,
        teacherSafetyScore: safetyScore,
        teacherGazeAngle: inCentralCone ? 'Direct Central Cone' : isExtremeCorner ? 'Far Blindspot' : 'Moderate Angle',
        distanceToTeacherPx: Math.round(distToTeacher),
        occlusionFactor: Math.min(100, Math.round((r - 1) * 25)),
        notes:
          r === 1 && inCentralCone
            ? 'Directly in the teacher’s crosshairs. Immediate question target.'
            : r === benchesCount && isExtremeCorner
            ? 'Maximum distance and angle from teacher podium. Maximum visual shielding.'
            : `Protected by ${r - 1} rows of student heads in front.`,
        metrics: {
          board_visibility: Math.round(Math.max(20, 100 - (r / benchesCount) * 40)),
          teacher_safety: safetyScore,
          teacher_visibility: 100 - safetyScore,
          fan_exposure: Math.round(40 + Math.random() * 40),
          phone_safety: phoneSafety,
          sleep_potential: sleepPotential,
          escape_probability: Math.round(30 + (r / benchesCount) * 60),
          friend_proximity: 60,
          comfort: Math.round((safetyScore + phoneSafety) / 2),
          question_probability: questionRisk,
          teacher_detection_risk: questionRisk,
          boredom_risk: Math.round(100 - (safetyScore * 0.4 + 40))
        }
      };

      seats.push(seatObj);
      rowSeats.push(seatObj);
      seatIdCounter++;
    }

    const avgRowSafety = Math.round(
      rowSeats.reduce((acc, cur) => acc + (cur.teacherSafetyScore || 50), 0) / rowSeats.length
    );

    benches.push({
      benchId: r,
      rowNumber: r,
      label:
        r === 1
          ? 'Front Row (Immediate Teacher Eye Contact)'
          : r === benchesCount
          ? 'Backbench Row (Maximum Stealth & Cover)'
          : `Row ${r} Bench`,
      capacity: studentsPerBench,
      x: 400,
      y: rowY,
      width: rowWidth,
      height: 48,
      averageSafetyScore: avgRowSafety,
      seatIds: rowSeats.map(s => s.seat_id),
      notes:
        r === 1
          ? 'Direct line-of-sight hazard. Eye-contact unavoidable.'
          : `Row ${r} with ${r - 1} layers of front visual occlusion.`
    });
  }

  // Sort and assign ranks
  const sorted = [...seats].sort((a, b) => (b.teacherSafetyScore || 0) - (a.teacherSafetyScore || 0));
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
      seat_id: bestSeat.seat_id,
      label: bestSeat.label,
      benchRow: bestSeat.rowNumber || 1,
      safetyScore: bestSeat.teacherSafetyScore || 95,
      tacticalReasoning: `Located in Row ${bestSeat.rowNumber} (${bestSeat.label}). Sits at maximum depth from the teacher's podium, benefits from ${
        (bestSeat.rowNumber || 1) - 1
      } layers of student head cover in front, and falls outside the teacher's primary forward gaze cone.`
    },
    worstSeat: {
      seat_id: worstSeat.seat_id,
      label: worstSeat.label,
      benchRow: worstSeat.rowNumber || 1,
      safetyScore: worstSeat.teacherSafetyScore || 10,
      tacticalReasoning: `Located in Row ${worstSeat.rowNumber} directly in front of the teacher. Full direct line of sight with zero occlusion and highest chance of being called on.`
    }
  };
}

export async function analyzeClassroomImage(params: {
  imageBase64?: string;
  imagePath?: string;
  studentsPerBench?: number;
  forcedBenches?: number;
}): Promise<AnalysisResult> {
  try {
    const res = await fetch('/api/analyze-classroom', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    });

    if (!res.ok) {
      throw new Error(`API returned status ${res.status}`);
    }

    const json = await res.json();
    if (json.success && json.data) {
      return json.data as AnalysisResult;
    }
    throw new Error(json.error || 'Failed to parse AI analysis response');
  } catch (err) {
    console.warn('Backend /api/analyze-classroom fallback to client-side engine:', err);
    return generateClientPerspectiveBenches(
      params.forcedBenches || 5,
      params.studentsPerBench || 3,
      'Perspective analysis computed locally (Teacher POV camera angle).'
    );
  }
}

export function convertAnalysisToClassroomData(
  analysis: AnalysisResult,
  baseClassroom: ClassroomData
): ClassroomData {
  const seats: Seat[] = analysis.seats.map(s => ({
    id: s.seat_id,
    x: s.x,
    y: s.y,
    occupied: s.occupied,
    label: s.label,
    benchId: s.benchId,
    rowNumber: s.rowNumber,
    positionIndex: s.positionIndex,
    teacherSafetyScore: s.teacherSafetyScore,
    teacherGazeAngle: s.teacherGazeAngle,
    distanceToTeacherPx: s.distanceToTeacherPx,
    occlusionFactor: s.occlusionFactor,
    notes: s.notes
  }));

  return {
    ...baseClassroom,
    seats,
    benches: analysis.benches,
    teacher: {
      x: 400,
      y: 580,
      label: 'Teacher Podium (Camera POV)'
    },
    board: {
      x: 400,
      y: 595,
      label: 'Blackboard / Screen'
    }
  };
}

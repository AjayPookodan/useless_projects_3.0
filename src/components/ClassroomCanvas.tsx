import React, { useState, useRef } from 'react';
import { ClassroomData, ScoredSeat, Landmark } from '../types';
import { Crown, User, UserX, Fan, LogOut, Presentation, Sparkles, Plus, Check, Upload, Eye, Flame, ShieldAlert, ShieldCheck } from 'lucide-react';

interface ClassroomCanvasProps {
  classroom: ClassroomData;
  rankedSeats: ScoredSeat[];
  bestSeat: ScoredSeat | null;
  worstSeat: ScoredSeat | null;
  selectedSeatId: number | null;
  onSelectSeat: (id: number) => void;
  onToggleOccupancy: (id: number) => void;
  onAddSeat: (x: number, y: number) => void;
  onUpdateLandmark: (key: keyof ClassroomData, x: number, y: number) => void;
  manualMode: boolean;
  isScanning: boolean;
  imageSrc: string;
  onDropImage?: (imageSrc: string) => void;
  showVisionCone?: boolean;
  showSafetyHeatmap?: boolean;
}

export const ClassroomCanvas: React.FC<ClassroomCanvasProps> = ({
  classroom,
  rankedSeats,
  bestSeat,
  worstSeat,
  selectedSeatId,
  onSelectSeat,
  onToggleOccupancy,
  onAddSeat,
  onUpdateLandmark,
  manualMode,
  isScanning,
  imageSrc,
  onDropImage,
  showVisionCone = true,
  showSafetyHeatmap = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredSeat, setHoveredSeat] = useState<ScoredSeat | null>(null);
  const [activePlacement, setActivePlacement] = useState<'seat' | 'teacher' | 'board' | 'fan' | 'exit' | null>('seat');
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0] && onDropImage) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = ev => {
          if (ev.target?.result) {
            onDropImage(ev.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Normalize to 800x600 coordinate space
    const scaleX = 800 / rect.width;
    const scaleY = 600 / rect.height;
    const normX = Math.round(clickX * scaleX);
    const normY = Math.round(clickY * scaleY);

    if (manualMode) {
      if (activePlacement === 'seat') {
        onAddSeat(normX, normY);
      } else if (activePlacement && activePlacement in classroom) {
        onUpdateLandmark(activePlacement as keyof ClassroomData, normX, normY);
      }
    }
  };

  // Helper for heatmap colors
  const getSeatColor = (seat: { id: number; occupied: boolean; teacherSafetyScore?: number }, scored?: ScoredSeat) => {
    if (bestSeat?.seat_id === seat.id) {
      return 'bg-emerald-500 border-white text-slate-950 font-black ring-4 ring-emerald-500/60 shadow-emerald-500/60';
    }
    if (worstSeat?.seat_id === seat.id && !seat.occupied) {
      return 'bg-rose-950 border-rose-500 text-rose-200 font-bold ring-2 ring-rose-600/60';
    }
    if (seat.occupied) {
      return 'bg-slate-800/90 border-slate-600 text-slate-400 opacity-60';
    }

    if (showSafetyHeatmap) {
      const safety = seat.teacherSafetyScore ?? (scored ? scored.final_score : 50);
      if (safety >= 82) {
        return 'bg-emerald-500 border-emerald-300 text-slate-950 font-bold shadow-lg shadow-emerald-500/30';
      }
      if (safety >= 65) {
        return 'bg-teal-500 border-teal-200 text-slate-950 font-bold shadow-md';
      }
      if (safety >= 45) {
        return 'bg-amber-400 border-amber-200 text-slate-950 font-bold shadow-md';
      }
      return 'bg-rose-600 border-rose-300 text-white font-bold shadow-md shadow-rose-900/40';
    }

    return 'bg-amber-400 border-amber-100 text-slate-950 font-bold';
  };

  const teacherX = classroom.teacher ? (classroom.teacher.x / 800) * 100 : 50;
  const teacherY = classroom.teacher ? (classroom.teacher.y / 600) * 100 : 96;

  return (
    <div className="relative flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Banner Toolbar */}
      <div className="bg-slate-950/80 px-4 py-2.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 z-20 text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-mono uppercase font-bold text-slate-300">Classroom Spatial Layout</span>
          <span className="text-cyan-400 font-mono font-bold">
            ({classroom.benches ? `${classroom.benches.length} Benches • ` : ''}{classroom.seats.length} Total Chairs)
          </span>
        </div>

        {/* Heatmap & Legend */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
            <span className="text-[10px] text-slate-400 font-mono">Teacher Safety:</span>
            <div className="flex items-center gap-1 text-[10px] font-mono">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500" title="Safest (80-100%)" />
              <span className="text-emerald-400">Safe</span>
              <span className="w-2.5 h-2.5 rounded bg-amber-400 ml-1" title="Moderate (45-79%)" />
              <span className="text-amber-300">Mid</span>
              <span className="w-2.5 h-2.5 rounded bg-rose-600 ml-1" title="High Risk (0-44%)" />
              <span className="text-rose-400">Danger</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-slate-800 border border-slate-600" />
            <span className="text-slate-400 font-medium text-[11px]">Occupied</span>
          </div>
        </div>
      </div>

      {/* Manual Mode Toolbar */}
      {manualMode && (
        <div className="bg-amber-950/40 border-b border-amber-800/40 px-4 py-2 flex flex-wrap items-center justify-between gap-2 z-20 text-xs">
          <div className="flex items-center gap-2 text-amber-300 font-medium">
            <span>🛠️ Manual Placement Active: Click on the image to place target</span>
          </div>
          <div className="flex items-center gap-1">
            {(['seat', 'teacher', 'board', 'fan', 'exit'] as const).map(item => (
              <button
                key={item}
                onClick={() => setActivePlacement(item)}
                className={`px-2.5 py-1 rounded text-xs capitalize transition ${
                  activePlacement === item
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                + {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Canvas Viewport */}
      <div
        ref={containerRef}
        onClick={handleCanvasClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="relative w-full aspect-[4/3] max-h-[580px] bg-slate-950 select-none overflow-hidden group cursor-crosshair"
      >
        {/* Drag and Drop Active Overlay */}
        {isDragOver && (
          <div className="absolute inset-0 z-40 bg-emerald-950/80 border-4 border-dashed border-emerald-400 flex flex-col items-center justify-center pointer-events-none backdrop-blur-sm animate-pulse">
            <Upload className="w-12 h-12 text-emerald-300 mb-2 animate-bounce" />
            <div className="text-emerald-300 font-mono text-base font-black uppercase tracking-wider">
              Drop Classroom Photo Here
            </div>
            <div className="text-emerald-400/80 text-xs font-mono">
              Auto-analyzing perspective from teacher's point of view
            </div>
          </div>
        )}

        {/* Background Classroom Image */}
        <img
          src={imageSrc}
          alt="Classroom Scan View"
          className="w-full h-full object-cover opacity-75 group-hover:opacity-85 transition duration-300"
          draggable={false}
        />

        {/* High-tech HUD grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        {/* TEACHER POINT OF VIEW VISION CONE (Projected outwards from Teacher POV) */}
        {showVisionCone && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-70">
            <defs>
              {/* Radial gradient from teacher's eyes */}
              <radialGradient id="teacherDirectGaze" cx="50%" cy="96%" r="80%" fx="50%" fy="96%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.35" />
                <stop offset="45%" stopColor="#f59e0b" stopOpacity="0.18" />
                <stop offset="85%" stopColor="#10b981" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
              </radialGradient>
              <linearGradient id="gazeRay" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Direct Eye-Contact Cone (Center Danger Zone) */}
            <polygon
              points="400,580 230,120 570,120"
              fill="url(#teacherDirectGaze)"
              stroke="#ef4444"
              strokeWidth="1"
              strokeDasharray="4 4"
              strokeOpacity="0.5"
            />

            {/* Central Optical Axis / Gaze Ray */}
            <line
              x1="400"
              y1="580"
              x2="400"
              y2="100"
              stroke="url(#gazeRay)"
              strokeWidth="2"
              strokeDasharray="3 3"
            />

            {/* Peripheral Boundary Rays */}
            <line x1="400" y1="580" x2="80" y2="150" stroke="#06b6d4" strokeWidth="1" strokeDasharray="5 5" strokeOpacity="0.4" />
            <line x1="400" y1="580" x2="720" y2="150" stroke="#06b6d4" strokeWidth="1" strokeDasharray="5 5" strokeOpacity="0.4" />

            {/* Labels in SVG */}
            <text x="400" y="240" fill="#ef4444" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold" opacity="0.85">
              ⚠ TEACHER CENTRAL GAZE CONE (HIGH RISK)
            </text>
            <text x="130" y="200" fill="#10b981" fontSize="9" fontFamily="monospace" textAnchor="middle" opacity="0.8">
              🛡️ LEFT BLINDSPOT
            </text>
            <text x="670" y="200" fill="#10b981" fontSize="9" fontFamily="monospace" textAnchor="middle" opacity="0.8">
              🛡️ RIGHT BLINDSPOT
            </text>
          </svg>
        )}

        {/* PHYSICAL BENCHES DRAWN ACROSS PERSPECTIVE */}
        {classroom.benches?.map(bench => {
          const benchLeft = ((bench.x - bench.width / 2) / 800) * 100;
          const benchTop = (bench.y / 600) * 100;
          const benchW = (bench.width / 800) * 100;

          return (
            <div
              key={bench.benchId}
              style={{
                left: `${benchLeft}%`,
                top: `${benchTop}%`,
                width: `${benchW}%`
              }}
              className="absolute -translate-y-1/2 z-10 pointer-events-none"
            >
              {/* Bench desk frame */}
              <div className="relative w-full h-11 rounded-lg bg-slate-900/75 border border-slate-700/80 shadow-md backdrop-blur-[1px] flex items-center justify-between px-3">
                {/* Left Bench Tag */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold text-slate-300">
                    Row {bench.rowNumber}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">
                    ({bench.capacity} Seats)
                  </span>
                </div>

                {/* Right Safety Badge */}
                <div className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-950/80 border border-slate-700 text-slate-300">
                  Avg: {bench.averageSafetyScore}% Safe
                </div>
              </div>
            </div>
          );
        })}

        {/* Radar Scanning Line Animation */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
            <div className="w-full h-24 bg-gradient-to-b from-emerald-500/20 via-emerald-400/40 to-transparent border-t-2 border-emerald-400 animate-[scan_2s_ease-in-out_infinite]" />
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 backdrop-blur-[2px]">
              <div className="bg-slate-900/90 border border-emerald-500/50 rounded-xl px-6 py-4 flex items-center gap-3 shadow-2xl">
                <Sparkles className="w-6 h-6 text-emerald-400 animate-spin" />
                <div>
                  <div className="text-emerald-400 font-mono text-sm font-bold tracking-wider">
                    ANALYZING CLASSROOM BENCHES & TEACHER POV...
                  </div>
                  <div className="text-slate-400 text-xs font-mono">
                    Triangulating line of sight, blindspots & seat safety
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LANDMARKS */}
        {/* Teacher / Camera POV Marker */}
        {classroom.teacher && (
          <div
            style={{
              left: `${teacherX}%`,
              top: `${teacherY}%`
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none flex flex-col items-center"
          >
            <div className="px-2.5 py-1 rounded-lg bg-blue-600/95 border-2 border-cyan-300 text-white font-mono text-[10px] font-black uppercase shadow-2xl flex items-center gap-1.5 animate-pulse">
              <Presentation className="w-3.5 h-3.5 text-cyan-200" />
              <span>TEACHER POV (CAMERA)</span>
            </div>
            <div className="w-2 h-2 bg-cyan-300 rotate-45 -mt-1" />
          </div>
        )}

        {/* Board */}
        {classroom.board && (
          <div
            style={{
              left: `${(classroom.board.x / 800) * 100}%`,
              top: `${(classroom.board.y / 600) * 100}%`
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none flex flex-col items-center"
          >
            <div className="px-2.5 py-0.5 rounded bg-emerald-700/90 border border-emerald-300 text-white font-mono text-[10px] font-black uppercase shadow-lg">
              CHALKBOARD
            </div>
          </div>
        )}

        {/* Fan */}
        {classroom.fan && (
          <div
            style={{
              left: `${(classroom.fan.x / 800) * 100}%`,
              top: `${(classroom.fan.y / 600) * 100}%`
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none flex flex-col items-center"
          >
            <div className="w-7 h-7 rounded-full bg-cyan-600/90 border border-cyan-300 flex items-center justify-center text-white shadow-lg">
              <Fan className="w-4 h-4 animate-spin" />
            </div>
            <span className="text-[9px] font-mono text-cyan-300 bg-slate-950/80 px-1 rounded mt-0.5">FAN</span>
          </div>
        )}

        {/* Exit */}
        {classroom.exit && (
          <div
            style={{
              left: `${(classroom.exit.x / 800) * 100}%`,
              top: `${(classroom.exit.y / 600) * 100}%`
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none flex flex-col items-center"
          >
            <div className="px-2 py-0.5 rounded bg-orange-600/90 border border-orange-300 text-white font-mono text-[10px] font-black uppercase shadow-lg flex items-center gap-1">
              <LogOut className="w-3 h-3" />
              <span>EXIT</span>
            </div>
          </div>
        )}

        {/* SEATS */}
        {classroom.seats.map(seat => {
          const scored = rankedSeats.find(s => s.seat_id === seat.id);
          const isBest = bestSeat?.seat_id === seat.id;
          const isWorst = worstSeat?.seat_id === seat.id && !seat.occupied;
          const isSelected = selectedSeatId === seat.id;
          const safety = seat.teacherSafetyScore ?? (scored ? scored.final_score : 50);

          const posX = (seat.x / 800) * 100;
          const posY = (seat.y / 600) * 100;

          return (
            <div
              key={seat.id}
              style={{ left: `${posX}%`, top: `${posY}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer transition-transform duration-200 hover:scale-125"
              onClick={e => {
                e.stopPropagation();
                onSelectSeat(seat.id);
              }}
              onDoubleClick={e => {
                e.stopPropagation();
                onToggleOccupancy(seat.id);
              }}
              onMouseEnter={() => setHoveredSeat(scored || null)}
              onMouseLeave={() => setHoveredSeat(null)}
            >
              {/* Outer Pulsing Aura for Best Seat */}
              {isBest && (
                <div className="absolute -inset-3 rounded-full bg-emerald-400/40 animate-ping pointer-events-none" />
              )}

              {/* Best Seat Crown */}
              {isBest && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-amber-300 drop-shadow-lg animate-bounce flex flex-col items-center">
                  <Crown className="w-4 h-4 fill-amber-300" />
                  <span className="text-[8px] font-mono font-black uppercase bg-emerald-950 text-emerald-300 px-1 rounded border border-emerald-400">
                    #1 BEST
                  </span>
                </div>
              )}

              {/* Worst Seat Target Skull */}
              {isWorst && !isBest && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-rose-400 drop-shadow-md">
                  <ShieldAlert className="w-3.5 h-3.5" />
                </div>
              )}

              {/* Seat Disc */}
              <div
                className={`w-9 h-9 rounded-full flex flex-col items-center justify-center shadow-xl border-2 transition ${getSeatColor(
                  seat,
                  scored
                )} ${isSelected ? 'ring-4 ring-cyan-400 scale-110' : ''}`}
              >
                <span className="text-[10px] leading-none font-mono font-bold">
                  #{seat.id}
                </span>
                <span className="text-[8px] leading-tight opacity-90 font-mono font-black">
                  {seat.occupied ? 'OCC' : `${safety}%`}
                </span>
              </div>

              {/* Quick Safety Badge Below */}
              {!seat.occupied && (
                <div
                  className={`mt-0.5 px-1 py-0.2 rounded text-[8px] font-mono font-bold tracking-tight text-center shadow ${
                    isBest
                      ? 'bg-emerald-950 border border-emerald-400 text-emerald-300'
                      : isWorst
                      ? 'bg-rose-950 border border-rose-500 text-rose-300'
                      : 'bg-slate-950/90 border border-slate-700 text-slate-300'
                  }`}
                >
                  {isBest ? 'BEST SEAT' : isWorst ? 'DEATH ROW' : `Safe: ${safety}%`}
                </div>
              )}
            </div>
          );
        })}

        {/* Hover Floating Tooltip */}
        {hoveredSeat && (
          <div
            style={{
              left: `${Math.min(Math.max((hoveredSeat.x / 800) * 100, 18), 82)}%`,
              top: `${Math.max((hoveredSeat.y / 600) * 100 - 16, 14)}%`
            }}
            className="absolute -translate-x-1/2 -translate-y-full z-30 pointer-events-none bg-slate-950/95 border border-slate-700 p-3 rounded-xl shadow-2xl backdrop-blur text-xs min-w-[210px]"
          >
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5 mb-1.5">
              <span className="font-bold text-white font-mono">
                {hoveredSeat.label} {hoveredSeat.medal}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-black ${
                  hoveredSeat.occupied ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
                }`}
              >
                {hoveredSeat.occupied ? 'OCCUPIED' : `${hoveredSeat.teacherSafetyScore ?? hoveredSeat.final_score}% Safe`}
              </span>
            </div>

            <div className="text-[11px] text-slate-300 mb-1.5">
              Teacher Gaze: <b className="text-cyan-300">{hoveredSeat.teacherGazeAngle || 'Standard View'}</b>
            </div>

            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] font-mono mb-2">
              <div className="text-slate-400">
                Safety: <span className="text-emerald-400 font-bold">{hoveredSeat.metrics.teacher_safety}%</span>
              </div>
              <div className="text-slate-400">
                Question Risk: <span className="text-rose-400 font-bold">{hoveredSeat.metrics.question_probability}%</span>
              </div>
              <div className="text-slate-400">
                Phone Cover: <span className="text-purple-400 font-bold">{hoveredSeat.metrics.phone_safety}%</span>
              </div>
              <div className="text-slate-400">
                Sleep Cover: <span className="text-indigo-400 font-bold">{hoveredSeat.metrics.sleep_potential}%</span>
              </div>
            </div>

            {hoveredSeat.notes && (
              <div className="text-[10px] text-slate-400 border-t border-slate-800/80 pt-1.5 italic">
                {hoveredSeat.notes}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom status bar */}
      <div className="bg-slate-950/90 border-t border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-3">
          <span>
            💡 <b>Teacher's POV:</b> Rank #1 is the safest seat from the teacher's gaze. Double-click any seat to toggle occupied.
          </span>
        </div>
        <div className="font-mono text-emerald-400 font-bold">
          Best Seat: #{bestSeat?.seat_id ?? 'None'} (Safety: {bestSeat?.teacherSafetyScore ?? bestSeat?.final_score.toFixed(1) ?? '0'}%)
        </div>
      </div>
    </div>
  );
};

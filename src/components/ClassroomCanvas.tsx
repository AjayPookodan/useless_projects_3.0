import React, { useState, useRef } from 'react';
import { ClassroomData, ScoredSeat, Landmark } from '../types';
import { Crown, User, UserX, Fan, LogOut, Presentation, Sparkles, Plus, Check } from 'lucide-react';

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
  imageSrc
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredSeat, setHoveredSeat] = useState<ScoredSeat | null>(null);
  const [activePlacement, setActivePlacement] = useState<'seat' | 'teacher' | 'board' | 'fan' | 'exit' | null>('seat');

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

  const getSeatScore = (id: number) => {
    const found = rankedSeats.find(s => s.seat_id === id);
    return found ? found.final_score : 0;
  };

  return (
    <div className="relative flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Top Banner Toolbar */}
      <div className="bg-slate-950/80 px-4 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 z-20 text-xs">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-mono uppercase font-bold text-slate-300">Live Spatial Sensor Grid</span>
          <span className="text-slate-500 font-mono">({classroom.seats.length} total chairs detected)</span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-emerald-500 border border-white" />
            <span className="text-slate-300 font-medium text-[11px]">Best Seat</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-amber-400 border border-slate-800" />
            <span className="text-slate-300 font-medium text-[11px]">Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-rose-500 border border-slate-800" />
            <span className="text-slate-300 font-medium text-[11px]">Occupied</span>
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
        className="relative w-full aspect-[4/3] max-h-[560px] bg-slate-950 select-none overflow-hidden group cursor-crosshair"
      >
        {/* Background Classroom Image */}
        <img
          src={imageSrc}
          alt="Classroom Scan View"
          className="w-full h-full object-cover opacity-75 group-hover:opacity-85 transition duration-300"
          draggable={false}
        />

        {/* Subtle grid lines for high-tech HUD feel */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        {/* Radar Scanning Line Animation */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="w-full h-24 bg-gradient-to-b from-emerald-500/20 via-emerald-400/40 to-transparent border-t-2 border-emerald-400 animate-[scan_2s_ease-in-out_infinite]" />
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 backdrop-blur-[2px]">
              <div className="bg-slate-900/90 border border-emerald-500/50 rounded-xl px-6 py-4 flex items-center gap-3 shadow-2xl">
                <Sparkles className="w-6 h-6 text-emerald-400 animate-spin" />
                <div>
                  <div className="text-emerald-400 font-mono text-sm font-bold tracking-wider">
                    RUNNING HEURISTIC OPTIMIZER...
                  </div>
                  <div className="text-slate-400 text-xs font-mono">
                    Triangulating seat distances & eye contact vectors
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LANDMARKS */}
        {/* Teacher */}
        <div
          style={{
            left: `${(classroom.teacher.x / 800) * 100}%`,
            top: `${(classroom.teacher.y / 600) * 100}%`
          }}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none flex flex-col items-center"
        >
          <div className="px-2 py-0.5 rounded bg-blue-600/90 border border-blue-300 text-white font-mono text-[10px] font-black uppercase shadow-lg flex items-center gap-1">
            <Presentation className="w-3 h-3" />
            <span>TEACHER</span>
          </div>
          <div className="w-1.5 h-1.5 bg-blue-400 rotate-45 -mt-0.5" />
        </div>

        {/* Board */}
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

        {/* Fan */}
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

        {/* Exit */}
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

        {/* Friends */}
        {classroom.friends?.map(friend => (
          <div
            key={friend.id}
            style={{
              left: `${(friend.x / 800) * 100}%`,
              top: `${(friend.y / 600) * 100}%`
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none flex flex-col items-center"
          >
            <div className="px-1.5 py-0.5 rounded-full bg-pink-600 border border-pink-300 text-white text-[9px] font-bold shadow">
              👥 {friend.name}
            </div>
          </div>
        ))}

        {/* SEATS */}
        {classroom.seats.map(seat => {
          const scored = rankedSeats.find(s => s.seat_id === seat.id);
          const isBest = bestSeat?.seat_id === seat.id;
          const isWorst = worstSeat?.seat_id === seat.id && !seat.occupied;
          const isSelected = selectedSeatId === seat.id;
          const score = scored ? scored.final_score : 0;

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
                <div className="absolute -inset-2.5 rounded-full bg-emerald-500/40 animate-ping pointer-events-none" />
              )}

              {/* Best Seat Crown */}
              {isBest && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-amber-300 drop-shadow-md animate-bounce">
                  <Crown className="w-4 h-4 fill-amber-300" />
                </div>
              )}

              {/* Seat Disc */}
              <div
                className={`w-9 h-9 rounded-full flex flex-col items-center justify-center shadow-xl border-2 transition ${
                  isBest
                    ? 'bg-emerald-500 border-white text-slate-950 font-black ring-4 ring-emerald-500/50 shadow-emerald-500/50'
                    : isWorst
                    ? 'bg-rose-900 border-rose-400 text-white font-bold'
                    : seat.occupied
                    ? 'bg-rose-600/90 border-rose-300 text-white font-semibold'
                    : 'bg-amber-400 border-amber-100 text-slate-950 font-bold'
                } ${isSelected ? 'ring-4 ring-cyan-400 scale-110' : ''}`}
              >
                <span className="text-[11px] leading-none font-mono">#{seat.id}</span>
                <span className="text-[8px] leading-tight opacity-90 font-mono">
                  {seat.occupied ? 'OCC' : score.toFixed(0)}
                </span>
              </div>

              {/* Quick score badge below */}
              {!seat.occupied && (
                <div
                  className={`mt-0.5 px-1 py-0.2 rounded text-[9px] font-mono font-bold tracking-tight text-center shadow ${
                    isBest
                      ? 'bg-emerald-950 border border-emerald-400 text-emerald-300'
                      : 'bg-slate-950/90 border border-slate-700 text-slate-300'
                  }`}
                >
                  {score.toFixed(1)}
                </div>
              )}
            </div>
          );
        })}

        {/* Hover Floating Tooltip */}
        {hoveredSeat && (
          <div
            style={{
              left: `${Math.min(Math.max((hoveredSeat.x / 800) * 100, 15), 85)}%`,
              top: `${Math.max((hoveredSeat.y / 600) * 100 - 15, 12)}%`
            }}
            className="absolute -translate-x-1/2 -translate-y-full z-30 pointer-events-none bg-slate-950/95 border border-slate-700 p-2.5 rounded-xl shadow-2xl backdrop-blur text-xs min-w-[180px]"
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
                {hoveredSeat.occupied ? 'OCCUPIED' : `${hoveredSeat.final_score.toFixed(2)}%`}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mb-1">
              Archetype: <b className="text-slate-200">{hoveredSeat.personality}</b>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10px] font-mono">
              <div className="text-slate-400">Board: <span className="text-blue-400 font-bold">{hoveredSeat.metrics.board_visibility.toFixed(0)}%</span></div>
              <div className="text-slate-400">Safety: <span className="text-emerald-400 font-bold">{hoveredSeat.metrics.teacher_safety.toFixed(0)}%</span></div>
              <div className="text-slate-400">Phone: <span className="text-purple-400 font-bold">{hoveredSeat.metrics.phone_safety.toFixed(0)}%</span></div>
              <div className="text-slate-400">Sleep: <span className="text-indigo-400 font-bold">{hoveredSeat.metrics.sleep_potential.toFixed(0)}%</span></div>
            </div>
            <div className="mt-1.5 pt-1 border-t border-slate-800/80 text-[10px] text-slate-500 italic">
              Double-click to toggle Occupied
            </div>
          </div>
        )}
      </div>

      {/* Bottom status bar */}
      <div className="bg-slate-950/90 border-t border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-3">
          <span>💡 <b>Tip:</b> Click any seat to inspect metrics. Double-click to toggle available/occupied.</span>
        </div>
        <div className="font-mono text-slate-500">
          Optimal: #{bestSeat?.seat_id ?? 'None'} ({bestSeat?.final_score.toFixed(2) ?? '0.00'}%)
        </div>
      </div>
    </div>
  );
};

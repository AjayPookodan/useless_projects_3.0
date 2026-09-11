import React from 'react';
import { ScoredSeat } from '../types';
import { UserCheck, UserX, Target, AlertCircle, Sparkles, X, Shield, Eye } from 'lucide-react';

interface SeatInspectorProps {
  seat: ScoredSeat | null;
  bestSeat: ScoredSeat | null;
  onClose: () => void;
  onToggleOccupancy: (id: number) => void;
}

export const SeatInspector: React.FC<SeatInspectorProps> = ({
  seat,
  bestSeat,
  onClose,
  onToggleOccupancy
}) => {
  if (!seat) return null;

  const isBest = bestSeat?.seat_id === seat.seat_id;
  const delta = bestSeat ? (bestSeat.final_score - seat.final_score).toFixed(1) : '0.0';
  const m = seat.metrics;
  const safetyScore = seat.teacherSafetyScore ?? Math.round(m.teacher_safety);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-black text-sm ${
              isBest
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/40'
                : seat.occupied
                ? 'bg-slate-800 text-slate-400 border border-slate-700'
                : 'bg-amber-400 text-slate-950'
            }`}
          >
            #{seat.seat_id}
          </div>
          <div>
            <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <span>{seat.label}</span>
              <span className="text-xs text-slate-400">({seat.personality})</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Teacher Safety: <b className="text-emerald-400">{safetyScore}%</b> | Gaze Angle:{' '}
              <b className="text-cyan-300">{seat.teacherGazeAngle || 'Standard'}</b>
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Bench and Perspective Details */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3 text-xs font-mono">
        <div className="bg-slate-950/70 border border-slate-800 p-2 rounded-lg">
          <span className="text-slate-400 block text-[10px]">Bench Location</span>
          <span className="text-slate-200 font-bold">
            {seat.rowNumber ? `Row ${seat.rowNumber} Bench` : 'Classroom Row'}
          </span>
        </div>
        <div className="bg-slate-950/70 border border-slate-800 p-2 rounded-lg">
          <span className="text-slate-400 block text-[10px]">Distance to Teacher</span>
          <span className="text-cyan-300 font-bold">
            {seat.distanceToTeacherPx ? `${seat.distanceToTeacherPx} px` : 'Far Field'}
          </span>
        </div>
        <div className="bg-slate-950/70 border border-slate-800 p-2 rounded-lg">
          <span className="text-slate-400 block text-[10px]">Front Head Occlusion</span>
          <span className="text-emerald-400 font-bold">
            {seat.occlusionFactor ? `${seat.occlusionFactor}% Shielded` : 'Direct Line of Sight'}
          </span>
        </div>
      </div>

      {/* Why did this seat lose / tactical notes */}
      {seat.notes && (
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 mb-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-cyan-400 font-bold mb-1">
            <Eye className="w-3.5 h-3.5" />
            <span>Teacher POV Tactical Assessment:</span>
          </div>
          <p className="text-slate-300 leading-relaxed font-sans">{seat.notes}</p>
        </div>
      )}

      {/* Metric Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 font-mono text-xs">
        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80">
          <span className="text-slate-500 block text-[10px]">Teacher Safety</span>
          <span className="text-emerald-400 font-bold">{safetyScore}%</span>
        </div>
        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80">
          <span className="text-slate-500 block text-[10px]">Question Risk</span>
          <span className="text-rose-400 font-bold">{m.question_probability.toFixed(0)}%</span>
        </div>
        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80">
          <span className="text-slate-500 block text-[10px]">Phone Safety</span>
          <span className="text-purple-400 font-bold">{m.phone_safety.toFixed(0)}%</span>
        </div>
        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80">
          <span className="text-slate-500 block text-[10px]">Sleep Potential</span>
          <span className="text-indigo-400 font-bold">{m.sleep_potential.toFixed(0)}%</span>
        </div>
      </div>

      {/* Occupancy Toggle */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
        <span className="text-xs text-slate-400">
          Status: <b className={seat.occupied ? 'text-rose-400' : 'text-emerald-400'}>{seat.occupied ? 'Occupied' : 'Available'}</b>
        </span>
        <button
          onClick={() => onToggleOccupancy(seat.seat_id)}
          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
            seat.occupied
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
              : 'bg-rose-600 hover:bg-rose-500 text-white'
          }`}
        >
          {seat.occupied ? 'Mark as Free' : 'Mark as Occupied'}
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import { ScoredSeat } from '../types';
import { UserCheck, UserX, Target, AlertCircle, Sparkles, X } from 'lucide-react';

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
  const delta = bestSeat ? (bestSeat.final_score - seat.final_score).toFixed(2) : '0.00';
  const m = seat.metrics;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-black text-sm ${
              isBest
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/40'
                : seat.occupied
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
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
              Score: <b className="text-emerald-400">{seat.final_score.toFixed(2)}%</b> | Rank: {seat.medal} #{seat.rank}
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

      {/* Why did this seat lose? */}
      {!isBest && !seat.occupied && bestSeat && (
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 mb-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Why did this chair lose to Seat #{bestSeat.seat_id}?</span>
          </div>
          <p className="text-slate-400 leading-relaxed font-sans">
            Trailing the mathematical champion by <b className="text-amber-300">-{delta}%</b>.
            {m.teacher_safety < 60 && ' Teacher eye contact danger is substantially elevated.'}
            {m.fan_exposure < 50 && ' Sub-optimal thermal circulation from ceiling fan.'}
            {m.board_visibility < 70 && ' Excessive lateral parallax distortion to the chalkboard.'}
            {m.escape_probability < 50 && ' Bottle-necked sprint corridor to the emergency exit.'}
          </p>
        </div>
      )}

      {/* Metric Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 font-mono text-xs">
        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80">
          <span className="text-slate-500 block text-[10px]">Board Visibility</span>
          <span className="text-blue-400 font-bold">{m.board_visibility.toFixed(1)}%</span>
        </div>
        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80">
          <span className="text-slate-500 block text-[10px]">Teacher Safety</span>
          <span className="text-emerald-400 font-bold">{m.teacher_safety.toFixed(1)}%</span>
        </div>
        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80">
          <span className="text-slate-500 block text-[10px]">Phone Safety</span>
          <span className="text-purple-400 font-bold">{m.phone_safety.toFixed(1)}%</span>
        </div>
        <div className="bg-slate-950 p-2 rounded-lg border border-slate-800/80">
          <span className="text-slate-500 block text-[10px]">Sleep Potential</span>
          <span className="text-indigo-400 font-bold">{m.sleep_potential.toFixed(1)}%</span>
        </div>
      </div>

      {/* Action: Toggle Occupied */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
        <span className="text-xs text-slate-400">
          Current state:{' '}
          <b className={seat.occupied ? 'text-rose-400' : 'text-emerald-400'}>
            {seat.occupied ? 'Occupied by someone' : 'Available to sit'}
          </b>
        </span>
        <button
          onClick={() => onToggleOccupancy(seat.seat_id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            seat.occupied
              ? 'bg-emerald-600 hover:bg-emerald-500 text-slate-950'
              : 'bg-rose-600 hover:bg-rose-500 text-white'
          }`}
        >
          {seat.occupied ? (
            <>
              <UserCheck className="w-3.5 h-3.5" /> Mark as Free
            </>
          ) : (
            <>
              <UserX className="w-3.5 h-3.5" /> Mark as Occupied
            </>
          )}
        </button>
      </div>
    </div>
  );
};

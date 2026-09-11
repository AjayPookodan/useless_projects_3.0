import React from 'react';
import { ScoredSeat } from '../types';
import { Skull, AlertOctagon, XCircle } from 'lucide-react';

interface WorstSeatCardProps {
  worstSeat: ScoredSeat | null;
}

export const WorstSeatCard: React.FC<WorstSeatCardProps> = ({ worstSeat }) => {
  if (!worstSeat) return null;

  const m = worstSeat.metrics;

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-rose-600/80 bg-gradient-to-br from-slate-950 via-rose-950/40 to-slate-900 p-6 shadow-2xl shadow-rose-950/40">
      <div className="flex items-center justify-between gap-3 border-b border-rose-900/60 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <Skull className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black tracking-wider text-rose-400 uppercase font-mono">
              💀 DISASTER AVOIDANCE: WORST SEAT
            </h3>
            <span className="text-xs text-rose-300/80">
              Statistically the most hazardous chair in the entire classroom
            </span>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-black font-mono text-rose-500">
            SEAT #{worstSeat.seat_id}
          </div>
          <div className="text-xs font-mono text-rose-300">
            {worstSeat.final_score.toFixed(2)} / 100.00
          </div>
        </div>
      </div>

      {/* Hazard bullet list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono mb-4">
        <div className="flex items-center gap-2 bg-rose-950/50 border border-rose-900/40 px-3 py-2 rounded-lg text-rose-200">
          <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span>Question Probability: <b>{m.question_probability.toFixed(2)}%</b> (Lethal)</span>
        </div>
        <div className="flex items-center gap-2 bg-rose-950/50 border border-rose-900/40 px-3 py-2 rounded-lg text-rose-200">
          <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span>Teacher Safety: <b>{m.teacher_safety.toFixed(2)}%</b> (Extreme Danger)</span>
        </div>
        <div className="flex items-center gap-2 bg-rose-950/50 border border-rose-900/40 px-3 py-2 rounded-lg text-rose-200">
          <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span>Fan Exposure: <b>{m.fan_exposure.toFixed(2)}%</b> (Zero Breeze)</span>
        </div>
        <div className="flex items-center gap-2 bg-rose-950/50 border border-rose-900/40 px-3 py-2 rounded-lg text-rose-200">
          <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          <span>Escape Probability: <b>{m.escape_probability.toFixed(2)}%</b> (Trap Zone)</span>
        </div>
      </div>

      {/* Final blunt verdict */}
      <div className="bg-slate-950/80 border border-rose-900/60 p-3.5 rounded-xl flex items-center gap-3">
        <AlertOctagon className="w-5 h-5 text-rose-500 shrink-0" />
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-rose-400 font-bold">
            FATAL VERDICT
          </div>
          <p className="text-xs md:text-sm text-rose-100 font-serif italic">
            "{worstSeat.funny_verdict || "You might as well sit on the teacher's desk."}"
          </p>
        </div>
      </div>
    </div>
  );
};

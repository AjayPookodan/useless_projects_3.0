import React, { useState } from 'react';
import { ScoredSeat } from '../types';
import { GitCompare, ArrowRight, Check, X } from 'lucide-react';

interface SeatComparatorProps {
  rankedSeats: ScoredSeat[];
}

export const SeatComparator: React.FC<SeatComparatorProps> = ({ rankedSeats }) => {
  const availableSeats = rankedSeats.filter(s => !s.occupied);
  const [seatAId, setSeatAId] = useState<number>(availableSeats[0]?.seat_id ?? 1);
  const [seatBId, setSeatBId] = useState<number>(availableSeats[1]?.seat_id ?? 2);

  const seatA = rankedSeats.find(s => s.seat_id === seatAId);
  const seatB = rankedSeats.find(s => s.seat_id === seatBId);

  if (!seatA || !seatB) return null;

  const compareMetrics = [
    { label: 'Overall Score', keyA: seatA.final_score, keyB: seatB.final_score, higherIsBetter: true },
    { label: 'Board Visibility', keyA: seatA.metrics.board_visibility, keyB: seatB.metrics.board_visibility, higherIsBetter: true },
    { label: 'Teacher Safety', keyA: seatA.metrics.teacher_safety, keyB: seatB.metrics.teacher_safety, higherIsBetter: true },
    { label: 'Fan Exposure', keyA: seatA.metrics.fan_exposure, keyB: seatB.metrics.fan_exposure, higherIsBetter: true },
    { label: 'Phone Safety', keyA: seatA.metrics.phone_safety, keyB: seatB.metrics.phone_safety, higherIsBetter: true },
    { label: 'Sleep Potential', keyA: seatA.metrics.sleep_potential, keyB: seatB.metrics.sleep_potential, higherIsBetter: true },
    { label: 'Escape Probability', keyA: seatA.metrics.escape_probability, keyB: seatB.metrics.escape_probability, higherIsBetter: true },
    { label: 'Question Probability', keyA: seatA.metrics.question_probability, keyB: seatB.metrics.question_probability, higherIsBetter: false }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl">
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <GitCompare className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white tracking-wide">
            Seat Duel: Head-to-Head Telemetry
          </h2>
        </div>

        {/* Seat Selectors */}
        <div className="flex items-center gap-2 text-xs">
          <select
            value={seatAId}
            onChange={e => setSeatAId(Number(e.target.value))}
            aria-label="Select first seat to compare"
            className="bg-slate-950 border border-slate-700 text-cyan-300 rounded px-2.5 py-1 font-mono font-bold"
          >
            {rankedSeats.map(s => (
              <option key={s.seat_id} value={s.seat_id}>
                Seat #{s.seat_id} ({s.final_score.toFixed(1)})
              </option>
            ))}
          </select>
          <span className="text-slate-500 font-bold">VS</span>
          <select
            value={seatBId}
            onChange={e => setSeatBId(Number(e.target.value))}
            aria-label="Select second seat to compare"
            className="bg-slate-950 border border-slate-700 text-amber-300 rounded px-2.5 py-1 font-mono font-bold"
          >
            {rankedSeats.map(s => (
              <option key={s.seat_id} value={s.seat_id}>
                Seat #{s.seat_id} ({s.final_score.toFixed(1)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Head to head overview cards */}
      <div className="grid grid-cols-2 gap-4 mb-4 font-mono">
        <div className="bg-slate-950 border border-cyan-900/60 rounded-xl p-3 text-center">
          <span className="text-xs text-cyan-400 font-bold uppercase">{seatA.personality}</span>
          <h3 className="text-2xl font-black text-white my-1">SEAT #{seatA.seat_id}</h3>
          <div className="text-xl font-bold text-cyan-400">{seatA.final_score.toFixed(2)}%</div>
          <p className="text-[11px] text-slate-400 mt-1 font-sans">Rank: {seatA.medal} #{seatA.rank}</p>
        </div>

        <div className="bg-slate-950 border border-amber-900/60 rounded-xl p-3 text-center">
          <span className="text-xs text-amber-400 font-bold uppercase">{seatB.personality}</span>
          <h3 className="text-2xl font-black text-white my-1">SEAT #{seatB.seat_id}</h3>
          <div className="text-xl font-bold text-amber-400">{seatB.final_score.toFixed(2)}%</div>
          <p className="text-[11px] text-slate-400 mt-1 font-sans">Rank: {seatB.medal} #{seatB.rank}</p>
        </div>
      </div>

      {/* Metric comparison rows */}
      <div className="space-y-1.5 font-mono text-xs">
        {compareMetrics.map((row, idx) => {
          const aWins = row.higherIsBetter ? row.keyA > row.keyB : row.keyA < row.keyB;
          const bWins = row.higherIsBetter ? row.keyB > row.keyA : row.keyB < row.keyA;
          const diff = (row.keyA - row.keyB).toFixed(2);

          return (
            <div
              key={idx}
              className="flex items-center justify-between bg-slate-950/60 border border-slate-800/80 px-3 py-2 rounded-lg"
            >
              <div className={`w-20 text-left font-bold ${aWins ? 'text-emerald-400' : 'text-slate-400'}`}>
                {row.keyA.toFixed(2)}%
              </div>

              <div className="text-center text-slate-300 font-sans font-medium text-[11px] flex-1">
                {row.label}
              </div>

              <div className={`w-20 text-right font-bold ${bWins ? 'text-emerald-400' : 'text-slate-400'}`}>
                {row.keyB.toFixed(2)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

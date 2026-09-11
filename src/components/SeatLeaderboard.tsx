import React, { useState } from 'react';
import { ScoredSeat } from '../types';
import { Trophy, Filter, ArrowUpDown, ShieldCheck, Eye, Sparkles } from 'lucide-react';

interface SeatLeaderboardProps {
  rankedSeats: ScoredSeat[];
  selectedSeatId: number | null;
  onSelectSeat: (id: number) => void;
}

export const SeatLeaderboard: React.FC<SeatLeaderboardProps> = ({
  rankedSeats,
  selectedSeatId,
  onSelectSeat
}) => {
  const [filter, setFilter] = useState<'all' | 'available' | 'occupied'>('all');
  const [sortBy, setSortBy] = useState<'safety' | 'overall' | 'row'>('safety');

  const filteredSeats = rankedSeats.filter(s => {
    if (filter === 'available') return !s.occupied;
    if (filter === 'occupied') return s.occupied;
    return true;
  });

  const sortedSeats = [...filteredSeats].sort((a, b) => {
    if (sortBy === 'safety') {
      const aSafety = a.teacherSafetyScore ?? a.metrics.teacher_safety;
      const bSafety = b.teacherSafetyScore ?? b.metrics.teacher_safety;
      return bSafety - aSafety;
    }
    if (sortBy === 'row') {
      return (b.rowNumber || 0) - (a.rowNumber || 0);
    }
    return b.final_score - a.final_score;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <div>
            <h2 className="text-base font-bold text-white tracking-wide">
              Teacher Safety Seating Leaderboard
            </h2>
            <p className="text-xs text-slate-400">
              Ranked in order of teacher avoidance safety, occlusion & blindspot factor
            </p>
          </div>
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Sort selector */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <span className="text-slate-500 px-1 text-[11px]">Rank by:</span>
            <button
              onClick={() => setSortBy('safety')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                sortBy === 'safety'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Teacher Safety
            </button>
            <button
              onClick={() => setSortBy('overall')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                sortBy === 'overall'
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Overall
            </button>
          </div>

          {/* Filter chips */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                filter === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({rankedSeats.length})
            </button>
            <button
              onClick={() => setFilter('available')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                filter === 'available'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Available
            </button>
            <button
              onClick={() => setFilter('occupied')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                filter === 'occupied'
                  ? 'bg-rose-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Occupied
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3">Safety Rank</th>
              <th className="py-2.5 px-3">Seat & Bench</th>
              <th className="py-2.5 px-3">Teacher Safety</th>
              <th className="py-2.5 px-3">Teacher Gaze Angle</th>
              <th className="py-2.5 px-3">Question Risk</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Overall Score</th>
              <th className="py-2.5 px-3">Verdict</th>
              <th className="py-2.5 px-3">Phone</th>
              <th className="py-2.5 px-3">Sleep</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {sortedSeats.map((seat, index) => {
              const isSelected = selectedSeatId === seat.seat_id;
              const isFirst = index === 0 && !seat.occupied;
              const safetyScore = seat.teacherSafetyScore ?? seat.metrics.teacher_safety;

              return (
                <tr
                  key={seat.seat_id}
                  onClick={() => onSelectSeat(seat.seat_id)}
                  className={`cursor-pointer transition hover:bg-slate-800/50 ${
                    isSelected ? 'bg-cyan-950/40 border-l-4 border-l-cyan-400' : ''
                  } ${isFirst ? 'bg-emerald-950/20' : ''}`}
                >
                  <td className="py-2.5 px-3 font-bold text-slate-300">
                    <span className="text-sm mr-1">
                      {index === 0 ? '👑' : index === 1 ? '🥈' : index === 2 ? '🥉' : ''}
                    </span>
                    #{index + 1}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-white">
                    #{seat.seat_id}{' '}
                    <span className="text-[10px] text-slate-400 font-normal">
                      ({seat.rowNumber ? `Row ${seat.rowNumber}` : 'Bench'} • Slot {seat.positionIndex || 1})
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded font-black text-xs ${
                        safetyScore >= 80
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : safetyScore >= 50
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {safetyScore}% Safe
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-cyan-300 font-sans text-xs">
                    {seat.teacherGazeAngle || 'Standard View'}
                  </td>
                  <td className="py-2.5 px-3 text-rose-400">
                    {seat.metrics.question_probability.toFixed(0)}%
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        seat.occupied
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {seat.occupied ? 'OCCUPIED' : 'AVAILABLE'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-black text-slate-200">
                    {seat.final_score.toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-300 font-sans">
                    {seat.verdict}
                  </td>
                  <td className="py-2.5 px-3 text-purple-400">
                    {seat.metrics.phone_safety.toFixed(0)}%
                  </td>
                  <td className="py-2.5 px-3 text-indigo-400">
                    {seat.metrics.sleep_potential.toFixed(0)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

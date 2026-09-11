import React, { useState } from 'react';
import { ScoredSeat } from '../types';
import { Trophy, Filter, ArrowUpDown } from 'lucide-react';

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

  const filteredSeats = rankedSeats.filter(s => {
    if (filter === 'available') return !s.occupied;
    if (filter === 'occupied') return s.occupied;
    return true;
  });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h2 className="text-base font-bold text-white tracking-wide">
            Seat Optimization Leaderboard
          </h2>
          <span className="text-xs text-slate-500 font-mono">
            ({filteredSeats.length} ranked entries)
          </span>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded font-medium transition ${
              filter === 'all'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({rankedSeats.length})
          </button>
          <button
            onClick={() => setFilter('available')}
            className={`px-3 py-1 rounded font-medium transition ${
              filter === 'available'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Available
          </button>
          <button
            onClick={() => setFilter('occupied')}
            className={`px-3 py-1 rounded font-medium transition ${
              filter === 'occupied'
                ? 'bg-rose-600 text-white font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Occupied
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3">Rank</th>
              <th className="py-2.5 px-3">Seat</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Score</th>
              <th className="py-2.5 px-3">Verdict</th>
              <th className="py-2.5 px-3">Archetype</th>
              <th className="py-2.5 px-3">Board</th>
              <th className="py-2.5 px-3">Safety</th>
              <th className="py-2.5 px-3">Phone</th>
              <th className="py-2.5 px-3">Sleep</th>
              <th className="py-2.5 px-3">Escape</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filteredSeats.map(seat => {
              const isSelected = selectedSeatId === seat.seat_id;
              const isFirst = seat.rank === 1 && !seat.occupied;

              return (
                <tr
                  key={seat.seat_id}
                  onClick={() => onSelectSeat(seat.seat_id)}
                  className={`cursor-pointer transition hover:bg-slate-800/50 ${
                    isSelected ? 'bg-cyan-950/40 border-l-4 border-l-cyan-400' : ''
                  } ${isFirst ? 'bg-emerald-950/20' : ''}`}
                >
                  <td className="py-2.5 px-3 font-bold text-slate-300">
                    <span className="text-sm mr-1">{seat.medal}</span>
                    {seat.rank}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-white">
                    #{seat.seat_id}
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
                  <td className="py-2.5 px-3 font-black text-emerald-400 text-sm">
                    {seat.final_score.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-200">
                    {seat.verdict}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 font-sans font-medium">
                    {seat.personality}
                  </td>
                  <td className="py-2.5 px-3 text-blue-400">
                    {seat.metrics.board_visibility.toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-emerald-400">
                    {seat.metrics.teacher_safety.toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-purple-400">
                    {seat.metrics.phone_safety.toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-indigo-400">
                    {seat.metrics.sleep_potential.toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-amber-400">
                    {seat.metrics.escape_probability.toFixed(1)}%
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

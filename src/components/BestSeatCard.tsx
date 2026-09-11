import React from 'react';
import { ScoredSeat } from '../types';
import { Trophy, Volume2, Sparkles, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';

interface BestSeatCardProps {
  bestSeat: ScoredSeat | null;
}

export const BestSeatCard: React.FC<BestSeatCardProps> = ({ bestSeat }) => {
  if (!bestSeat) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400">
        No available seats detected in the classroom.
      </div>
    );
  }

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const speakVerdict = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = `According to our completely unnecessary analysis, seat number ${bestSeat.seat_id} is mathematically optimal. Final verdict: Sit here.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/40 p-6 md:p-8 shadow-2xl shadow-emerald-950/50">
      {/* Background glow & decorative accents */}
      <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          onClick={speakVerdict}
          className="p-2 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-400 transition"
          title="Voice Announcement (Speech Synthesis)"
        >
          <Volume2 className="w-4 h-4" />
        </button>
        <button
          onClick={triggerConfetti}
          className="p-2 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-400 transition"
          title="Celebrate with Confetti"
        >
          <Sparkles className="w-4 h-4" />
        </button>
      </div>

      <div className="text-center">
        {/* Top label */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold tracking-widest uppercase mb-3">
          <Trophy className="w-3.5 h-3.5" />
          MATHEMATICALLY VERIFIED BEST SEAT
        </div>

        {/* Seat Number */}
        <div className="font-mono text-5xl md:text-6xl font-black text-emerald-400 tracking-tighter my-1 drop-shadow-[0_0_20px_rgba(52,211,153,0.3)]">
          SEAT #{bestSeat.seat_id}
        </div>

        {/* Score with absurd precision */}
        <div className="font-mono text-2xl font-bold text-white mb-3">
          {bestSeat.final_score.toFixed(2)}{' '}
          <span className="text-sm font-normal text-slate-400">/ 100.00%</span>
        </div>

        {/* Big Verdict Pill */}
        <div className="inline-block bg-emerald-400 text-slate-950 font-black px-6 py-2 rounded-xl text-base tracking-wider uppercase shadow-lg shadow-emerald-500/30 mb-4 animate-pulse">
          FINAL VERDICT: SIT HERE.
        </div>

        {/* Funny quote */}
        <p className="text-sm md:text-base italic text-slate-300 max-w-md mx-auto mb-4 font-serif">
          "{bestSeat.funny_verdict || 'The AI has determined that this is the least regrettable chair.'}"
        </p>

        {/* Personality & Designation */}
        <div className="inline-flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1 rounded-lg text-xs text-slate-400 font-mono">
          <span>Designation:</span>
          <span className="font-bold text-slate-200">{bestSeat.personality}</span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400">Rank #1 of {bestSeat.rank || 1}</span>
        </div>
      </div>
    </div>
  );
};

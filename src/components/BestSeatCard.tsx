import React from 'react';
import { ScoredSeat } from '../types';
import { Trophy, Volume2, Sparkles, ShieldCheck, EyeOff, Layers, CheckCircle2 } from 'lucide-react';
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
      const text = `From the teacher's point of view, seat number ${bestSeat.seat_id} in row ${
        bestSeat.rowNumber || 'back'
      } is the safest seat in the classroom. Teacher safety rating: ${
        bestSeat.teacherSafetyScore || bestSeat.final_score.toFixed(0)
      } percent.`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  };

  const safetyScore = bestSeat.teacherSafetyScore ?? Math.round(bestSeat.final_score);

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
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-mono font-bold tracking-widest uppercase mb-2">
          <Trophy className="w-3.5 h-3.5" />
          RANK #1: SAFEST SEAT FROM TEACHER'S POV
        </div>

        {/* Seat Number */}
        <div className="font-mono text-5xl md:text-6xl font-black text-emerald-400 tracking-tighter my-1 drop-shadow-[0_0_20px_rgba(52,211,153,0.3)]">
          SEAT #{bestSeat.seat_id}
        </div>

        {/* Row and Bench Info */}
        <div className="text-xs font-mono text-slate-300 mb-2">
          {bestSeat.rowNumber ? `Row ${bestSeat.rowNumber} Bench` : 'Rear Bench'} • {bestSeat.label}
        </div>

        {/* Score with absurd precision & Teacher Safety */}
        <div className="flex items-center justify-center gap-3 my-2">
          <div className="bg-slate-950/80 border border-emerald-500/40 px-3 py-1.5 rounded-xl font-mono text-center">
            <span className="text-[10px] text-slate-400 block uppercase">Teacher Safety Score</span>
            <span className="text-2xl font-black text-emerald-400">{safetyScore}%</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl font-mono text-center">
            <span className="text-[10px] text-slate-400 block uppercase">Overall Matrix</span>
            <span className="text-2xl font-bold text-white">{bestSeat.final_score.toFixed(1)}%</span>
          </div>
        </div>

        {/* Big Verdict Pill */}
        <div className="inline-block bg-emerald-400 text-slate-950 font-black px-6 py-2 rounded-xl text-sm md:text-base tracking-wider uppercase shadow-lg shadow-emerald-500/30 mb-3 animate-pulse">
          FINAL VERDICT: SIT HERE.
        </div>

        {/* Tactical reasoning */}
        <div className="bg-slate-950/70 border border-slate-800/90 rounded-xl p-3 max-w-md mx-auto mb-3 text-left">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tactical Teacher POV Analysis</span>
          </div>
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            {bestSeat.notes ||
              `Positioned in Row ${bestSeat.rowNumber || 4}, maximizing optical distance from the teacher's podium. Front student heads create visual occlusion, dampening eye-contact and question risk.`}
          </p>
        </div>

        {/* Funny quote */}
        <p className="text-xs italic text-slate-400 max-w-md mx-auto mb-3 font-serif">
          "{bestSeat.funny_verdict || 'The AI has mathematically confirmed this is the optimal stealth sanctuary.'}"
        </p>

        {/* Personality & Designation */}
        <div className="inline-flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1 rounded-lg text-xs text-slate-400 font-mono">
          <span>Designation:</span>
          <span className="font-bold text-slate-200">{bestSeat.personality}</span>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400">Gaze Angle: {bestSeat.teacherGazeAngle || 'Peripheral'}</span>
        </div>
      </div>
    </div>
  );
};

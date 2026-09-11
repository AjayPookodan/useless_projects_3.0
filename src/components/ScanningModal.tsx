import React, { useEffect, useState } from 'react';
import { Sparkles, Terminal, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ScanningModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const SCAN_STEPS = [
  'Initializing Ultralytics YOLOv8 inference pipeline...',
  '✓ Detecting classroom boundaries and spatial perspective grid',
  '✓ Finding candidate chairs and bench silhouettes',
  '✓ Calculating chair-person IoU overlap (available vs occupied)',
  '✓ Detecting professor position and gaze vector triangulation',
  '✓ Measuring chalkboard optical glare and focal angles',
  '✓ Calculating ceiling fan Bernoulli turbulence dynamics',
  '✓ Estimating rapid eye movement (REM) sleep viability index',
  '✓ Calculating teacher interrogation and pop-quiz probability',
  '✓ Running 10,000 Monte Carlo seating optimization matrices',
  '✓ Consulting absolutely zero pedagogy or academic experts',
  '✓ Finalizing mathematically unassailable recommendation!'
];

export const ScanningModal: React.FC<ScanningModalProps> = ({ isOpen, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= SCAN_STEPS.length - 1) {
          clearInterval(interval);
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 }
          });
          setTimeout(() => {
            onComplete();
          }, 600);
          return prev;
        }
        return prev + 1;
      });
    }, 280);

    return () => clearInterval(interval);
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  const progressPct = Math.round(((currentStep + 1) / SCAN_STEPS.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-emerald-500/80 rounded-2xl p-6 shadow-2xl shadow-emerald-950/60 overflow-hidden relative">
        {/* Radar radar sweep glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400">
            <Terminal className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-mono tracking-wider">
              AI TELEMETRY OPTIMIZATION ENGINE
            </h3>
            <p className="text-xs text-slate-400">
              Running NASA-grade seating heuristic convergence
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs font-mono mb-1.5">
            <span className="text-emerald-400 font-bold">OPTIMIZATION MATRIX</span>
            <span className="text-slate-300 font-bold">{progressPct}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-400 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Terminal log output */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 h-64 overflow-y-auto font-mono text-xs space-y-1.5">
          {SCAN_STEPS.slice(0, currentStep + 1).map((step, idx) => {
            const isLatest = idx === currentStep;
            return (
              <div
                key={idx}
                className={`flex items-start gap-2 ${
                  isLatest ? 'text-emerald-300 font-bold animate-pulse' : 'text-slate-400'
                }`}
              >
                <span className="text-slate-600 select-none">[{idx + 1}]</span>
                <span>{step}</span>
              </div>
            );
          })}
        </div>

        <div className="mt-4 text-center">
          <span className="text-[11px] text-slate-500 font-mono animate-pulse">
            Executing over-engineered non-linear seating algorithms...
          </span>
        </div>
      </div>
    </div>
  );
};

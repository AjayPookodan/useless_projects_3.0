import React from 'react';
import {
  Eye,
  Rows,
  Users,
  ShieldCheck,
  Zap,
  Sparkles,
  Camera,
  Layers,
  Flame,
  HelpCircle
} from 'lucide-react';

interface TeacherPOVControlPanelProps {
  benchesCount: number;
  studentsPerBench: number;
  onBenchesChange: (count: number) => void;
  onCapacityChange: (capacity: number) => void;
  showVisionCone: boolean;
  onToggleVisionCone: () => void;
  showSafetyHeatmap: boolean;
  onToggleSafetyHeatmap: () => void;
  onReAnalyze: () => void;
  isAnalyzing: boolean;
  perspectiveAnalysis?: string;
  sourceType?: 'gemini_vision_ai' | 'geometric_engine' | 'client';
}

export const TeacherPOVControlPanel: React.FC<TeacherPOVControlPanelProps> = ({
  benchesCount,
  studentsPerBench,
  onBenchesChange,
  onCapacityChange,
  showVisionCone,
  onToggleVisionCone,
  showSafetyHeatmap,
  onToggleSafetyHeatmap,
  onReAnalyze,
  isAnalyzing,
  perspectiveAnalysis,
  sourceType = 'gemini_vision_ai'
}) => {
  const totalCapacity = benchesCount * studentsPerBench;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5 shadow-xl">
      {/* Top Banner: Teacher POV Angle Notice */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-white font-mono uppercase tracking-wider">
                Teacher's Point-of-View (POV) Perspective
              </h3>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                Camera at Front Podium
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Front rows are in the teacher's direct gaze crosshairs; back benches offer depth & head occlusion.
            </p>
          </div>
        </div>

        {/* AI status badge */}
        <div className="flex items-center gap-2">
          <button
            onClick={onReAnalyze}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-xs font-bold rounded-lg shadow-md transition active:scale-95 disabled:opacity-50"
            title="Re-analyze image with Gemini AI Vision"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Analyzing POV...' : 'Re-Analyze AI'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Controls Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* 1. Benches Detected */}
        <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Rows className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="text-[11px] font-mono text-slate-400 uppercase">Benches / Rows</div>
              <div className="text-base font-mono font-black text-white">{benchesCount} Benches</div>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => onBenchesChange(Math.max(2, benchesCount - 1))}
              className="w-6 h-6 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 rounded text-sm font-bold"
              title="Decrease benches"
            >
              -
            </button>
            <span className="w-5 text-center font-mono text-xs font-bold text-cyan-300">
              {benchesCount}
            </span>
            <button
              onClick={() => onBenchesChange(Math.min(10, benchesCount + 1))}
              className="w-6 h-6 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 rounded text-sm font-bold"
              title="Increase benches"
            >
              +
            </button>
          </div>
        </div>

        {/* 2. Students Per Bench */}
        <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-[11px] font-mono text-slate-400 uppercase">Students / Bench</div>
              <div className="text-base font-mono font-black text-white">{studentsPerBench} Per Bench</div>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => onCapacityChange(Math.max(1, studentsPerBench - 1))}
              className="w-6 h-6 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 rounded text-sm font-bold"
              title="Decrease students per bench"
            >
              -
            </button>
            <span className="w-5 text-center font-mono text-xs font-bold text-emerald-300">
              {studentsPerBench}
            </span>
            <button
              onClick={() => onCapacityChange(Math.min(5, studentsPerBench + 1))}
              className="w-6 h-6 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700 rounded text-sm font-bold"
              title="Increase students per bench"
            >
              +
            </button>
          </div>
        </div>

        {/* 3. Total Capacity */}
        <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-xl flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase">Room Capacity</div>
            <div className="text-base font-mono font-black text-indigo-300">
              {totalCapacity} Total Seats
            </div>
          </div>
        </div>

        {/* 4. Vision Overlay Toggles */}
        <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl flex items-center justify-around gap-1">
          <button
            onClick={onToggleVisionCone}
            className={`flex-1 flex flex-col items-center justify-center py-1 px-1.5 rounded-lg text-[10px] font-mono font-bold transition ${
              showVisionCone
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Toggle Teacher Eye Contact Vision Cone"
          >
            <Eye className="w-3.5 h-3.5 mb-0.5" />
            <span>Teacher Cone</span>
          </button>

          <button
            onClick={onToggleSafetyHeatmap}
            className={`flex-1 flex flex-col items-center justify-center py-1 px-1.5 rounded-lg text-[10px] font-mono font-bold transition ${
              showSafetyHeatmap
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Toggle Safety Heatmap Colors"
          >
            <Flame className="w-3.5 h-3.5 mb-0.5" />
            <span>Safety Heatmap</span>
          </button>
        </div>
      </div>

      {/* Perspective Note summary */}
      {perspectiveAnalysis && (
        <div className="mt-3 bg-slate-950/50 border border-slate-800/80 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-300 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">
            <b className="text-cyan-300">POV Analysis:</b> {perspectiveAnalysis}
          </span>
        </div>
      )}
    </div>
  );
};

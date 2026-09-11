import React from 'react';
import { Target, Play, Camera, Upload, Code2, Sparkles, AlertTriangle } from 'lucide-react';
import { ProfileName } from '../types';
import { PROFILES } from '../data/sampleClassroom';

interface HeaderProps {
  currentProfile: ProfileName;
  onProfileChange: (p: ProfileName) => void;
  onRunDemoScan: () => void;
  onOpenCamera: () => void;
  onUploadClick: () => void;
  onOpenCodeViewer: () => void;
  isScanning: boolean;
  manualMode: boolean;
  onToggleManualMode: () => void;
  onResetClassroom: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentProfile,
  onProfileChange,
  onRunDemoScan,
  onOpenCamera,
  onUploadClick,
  onOpenCodeViewer,
  isScanning,
  manualMode,
  onToggleManualMode,
  onResetClassroom
}) => {
  const profileList = Object.keys(PROFILES) as ProfileName[];
  const activeProfile = PROFILES[currentProfile];

  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-40 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Brand & Mission title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-950/40">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Target className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-black tracking-tight text-white flex items-center gap-2">
                BEST SEAT DETECTOR
                <span className="text-[10px] font-mono uppercase bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full">
                  AI v2.4 NASA-SPEC
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Over-engineered computer vision & mathematical optimization for classroom seating
            </p>
          </div>
        </div>

        {/* Profile Selector */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
            <span className="text-xs text-slate-400 px-2 font-medium flex items-center gap-1.5">
              <span>{activeProfile.icon}</span>
              <span className="hidden xl:inline">Profile:</span>
            </span>
            <select
              value={currentProfile}
              onChange={e => onProfileChange(e.target.value as ProfileName)}
              aria-label="Select student profile archetype"
              className="bg-slate-950 text-emerald-400 text-xs font-semibold rounded px-2.5 py-1 border border-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {profileList.map(name => (
                <option key={name} value={name}>
                  {PROFILES[name].icon} {name} ({PROFILES[name].personality})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Actions */}
          <button
            onClick={onRunDemoScan}
            disabled={isScanning}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg shadow-md shadow-emerald-900/20 transition active:scale-95 disabled:opacity-50"
            title="Simulate complete multi-stage AI scan"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Demo AI Scan</span>
          </button>

          <button
            onClick={onOpenCamera}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium rounded-lg transition active:scale-95"
            title="Use Webcam"
          >
            <Camera className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Camera</span>
          </button>

          <button
            onClick={onUploadClick}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium rounded-lg transition active:scale-95"
            title="Upload Photo"
          >
            <Upload className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Upload</span>
          </button>

          <button
            onClick={onToggleManualMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 border text-xs font-medium rounded-lg transition active:scale-95 ${
              manualMode
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300'
            }`}
            title="Manual seat & landmark placement fallback"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{manualMode ? 'Editing Map' : 'Edit Map'}</span>
          </button>

          <button
            onClick={onOpenCodeViewer}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium rounded-lg transition active:scale-95"
            title="View & Export Python/Streamlit Project Files"
          >
            <Code2 className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden md:inline">Python Files</span>
          </button>
        </div>
      </div>
    </header>
  );
};

import React, { useState, useRef, useMemo } from 'react';
import { ClassroomData, ProfileName, ScoredSeat } from './types';
import { DEFAULT_CLASSROOM } from './data/sampleClassroom';
import { rankAllSeats } from './scoring/engine';
import { Header } from './components/Header';
import { ClassroomCanvas } from './components/ClassroomCanvas';
import { BestSeatCard } from './components/BestSeatCard';
import { WorstSeatCard } from './components/WorstSeatCard';
import { MetricsGrid } from './components/MetricsGrid';
import { SeatLeaderboard } from './components/SeatLeaderboard';
import { SeatComparator } from './components/SeatComparator';
import { SeatInspector } from './components/SeatInspector';
import { ScanningModal } from './components/ScanningModal';
import { CameraCaptureModal } from './components/CameraCaptureModal';
import { CodeViewerModal } from './components/CodeViewerModal';
import {
  Sparkles,
  Layers,
  GitCompare,
  RotateCcw,
  Sliders,
  HelpCircle,
  Trophy,
  CheckCircle2
} from 'lucide-react';

export default function App() {
  const [classroom, setClassroom] = useState<ClassroomData>(DEFAULT_CLASSROOM);
  const [currentProfile, setCurrentProfile] = useState<ProfileName>('Balanced Student');
  const [imageSrc, setImageSrc] = useState<string>('/sample_classroom.jpg');
  const [selectedSeatId, setSelectedSeatId] = useState<number | null>(5);
  const [manualMode, setManualMode] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState<boolean>(false);
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [isCodeViewerOpen, setIsCodeViewerOpen] = useState<boolean>(false);
  const [showWorstSeat, setShowWorstSeat] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'duel' | 'leaderboard'>('overview');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute live scores and ranking whenever classroom or profile changes
  const { rankedSeats, bestSeat, worstSeat } = useMemo(() => {
    return rankAllSeats(classroom, currentProfile);
  }, [classroom, currentProfile]);

  const selectedSeat = useMemo(() => {
    if (!selectedSeatId) return null;
    return rankedSeats.find(s => s.seat_id === selectedSeatId) || null;
  }, [selectedSeatId, rankedSeats]);

  // Actions
  const handleToggleOccupancy = (id: number) => {
    setClassroom(prev => ({
      ...prev,
      seats: prev.seats.map(s => (s.id === id ? { ...s, occupied: !s.occupied } : s))
    }));
  };

  const handleAddSeat = (x: number, y: number) => {
    setClassroom(prev => {
      const newId = prev.seats.length > 0 ? Math.max(...prev.seats.map(s => s.id)) + 1 : 1;
      return {
        ...prev,
        seats: [
          ...prev.seats,
          {
            id: newId,
            x,
            y,
            occupied: false,
            label: `Seat #${newId}`
          }
        ]
      };
    });
  };

  const handleUpdateLandmark = (key: keyof ClassroomData, x: number, y: number) => {
    setClassroom(prev => {
      if (key === 'seats' || key === 'friends') return prev;
      return {
        ...prev,
        [key]: {
          ...(prev[key] as any),
          x,
          y
        }
      };
    });
  };

  const handleResetClassroom = () => {
    setClassroom(DEFAULT_CLASSROOM);
    setImageSrc('/sample_classroom.jpg');
    setSelectedSeatId(5);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        if (event.target?.result) {
          setImageSrc(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunDemoScan = () => {
    setIsScanning(true);
    setIsScanModalOpen(true);
  };

  const handleScanComplete = () => {
    setIsScanModalOpen(false);
    setIsScanning(false);
    if (bestSeat) {
      setSelectedSeatId(bestSeat.seat_id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Navigation Header */}
      <Header
        currentProfile={currentProfile}
        onProfileChange={setCurrentProfile}
        onRunDemoScan={handleRunDemoScan}
        onOpenCamera={() => setIsCameraOpen(true)}
        onUploadClick={() => fileInputRef.current?.click()}
        onOpenCodeViewer={() => setIsCodeViewerOpen(true)}
        isScanning={isScanning}
        manualMode={manualMode}
        onToggleManualMode={() => setManualMode(!manualMode)}
        onResetClassroom={handleResetClassroom}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-8">
        {/* Quick Tabs & Mission Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs font-bold">
              STATUS: MATRIX ONLINE
            </span>
            <span className="text-xs text-slate-400 hidden md:inline">
              Profile Archetype: <b className="text-white">{currentProfile}</b>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetClassroom}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs rounded-lg transition"
              title="Reset classroom to verified sample dataset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Layout</span>
            </button>

            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-1 rounded transition ${
                  activeTab === 'overview'
                    ? 'bg-emerald-600 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('duel')}
                className={`px-3 py-1 rounded transition ${
                  activeTab === 'duel'
                    ? 'bg-cyan-600 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Seat Duel
              </button>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`px-3 py-1 rounded transition ${
                  activeTab === 'leaderboard'
                    ? 'bg-purple-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Leaderboard
              </button>
            </div>
          </div>
        </div>

        {/* PRIMARY VIEWPORT: Map + Best Seat Card */}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Classroom Visualizer Canvas */}
              <div className="lg:col-span-7 space-y-4">
                <ClassroomCanvas
                  classroom={classroom}
                  rankedSeats={rankedSeats}
                  bestSeat={bestSeat}
                  worstSeat={worstSeat}
                  selectedSeatId={selectedSeatId}
                  onSelectSeat={setSelectedSeatId}
                  onToggleOccupancy={handleToggleOccupancy}
                  onAddSeat={handleAddSeat}
                  onUpdateLandmark={handleUpdateLandmark}
                  manualMode={manualMode}
                  isScanning={isScanning}
                  imageSrc={imageSrc}
                />

                {/* Seat Inspector Drawer (shows if user clicked a chair) */}
                {selectedSeat && (
                  <SeatInspector
                    seat={selectedSeat}
                    bestSeat={bestSeat}
                    onClose={() => setSelectedSeatId(null)}
                    onToggleOccupancy={handleToggleOccupancy}
                  />
                )}
              </div>

              {/* Right Column: Best Seat Card & Ridiculous Metrics */}
              <div className="lg:col-span-5 space-y-6">
                <BestSeatCard bestSeat={bestSeat} />

                {bestSeat && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        Absurdly Precise Telemetry (Seat #{bestSeat.seat_id})
                      </h2>
                      <span className="text-[10px] text-slate-500 font-mono">
                        σ = ±0.002%
                      </span>
                    </div>
                    <MetricsGrid metrics={bestSeat.metrics} />
                  </div>
                )}
              </div>
            </div>

            {/* Worst Seat Disaster Section */}
            {showWorstSeat && worstSeat && (
              <WorstSeatCard worstSeat={worstSeat} />
            )}

            {/* Complete Ranked Leaderboard below */}
            <SeatLeaderboard
              rankedSeats={rankedSeats}
              selectedSeatId={selectedSeatId}
              onSelectSeat={setSelectedSeatId}
            />
          </>
        )}

        {/* SEAT DUEL TAB */}
        {activeTab === 'duel' && (
          <div className="space-y-6">
            <SeatComparator rankedSeats={rankedSeats} />
            <ClassroomCanvas
              classroom={classroom}
              rankedSeats={rankedSeats}
              bestSeat={bestSeat}
              worstSeat={worstSeat}
              selectedSeatId={selectedSeatId}
              onSelectSeat={setSelectedSeatId}
              onToggleOccupancy={handleToggleOccupancy}
              onAddSeat={handleAddSeat}
              onUpdateLandmark={handleUpdateLandmark}
              manualMode={manualMode}
              isScanning={isScanning}
              imageSrc={imageSrc}
            />
          </div>
        )}

        {/* LEADERBOARD TAB */}
        {activeTab === 'leaderboard' && (
          <SeatLeaderboard
            rankedSeats={rankedSeats}
            selectedSeatId={selectedSeatId}
            onSelectSeat={setSelectedSeatId}
          />
        )}
      </main>

      {/* MODALS */}
      <ScanningModal isOpen={isScanModalOpen} onComplete={handleScanComplete} />
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={src => {
          setImageSrc(src);
          setIsCameraOpen(false);
        }}
      />
      <CodeViewerModal
        isOpen={isCodeViewerOpen}
        onClose={() => setIsCodeViewerOpen(false)}
      />
    </div>
  );
}

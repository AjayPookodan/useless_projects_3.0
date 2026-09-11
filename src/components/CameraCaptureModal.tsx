import React, { useRef, useState, useEffect } from 'react';
import {
  Camera,
  X,
  RefreshCw,
  Sparkles,
  SwitchCamera,
  AlertCircle,
  Upload,
  Check,
  Zap,
  Laptop,
  Video
} from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageSrc: string) => void;
}

const VIRTUAL_FEEDS = [
  { id: 'auditorium', label: 'Auditorium Hall', src: '/auditorium_hall.jpg' },
  { id: 'lecture', label: 'Lecture Theater', src: '/sample_classroom.jpg' },
  { id: 'seminar', label: 'Seminar Room', src: '/seminar_room.jpg' }
];

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [flash, setFlash] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [selectedVirtualFeed, setSelectedVirtualFeed] = useState<string>('/sample_classroom.jpg');
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stop media tracks
  const stopStream = (mediaStream: MediaStream | null) => {
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => {
        track.stop();
      });
    }
  };

  // Start Built-in Laptop Webcam
  const startCamera = async (targetDeviceId?: string) => {
    setError(null);
    setIsInitializing(true);
    stopStream(stream);

    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Webcam API is not supported in this browser window.');
      setIsInitializing(false);
      return;
    }

    try {
      // Prioritize standard laptop webcam:
      // Laptop built-in webcams use facingMode: "user" or can be picked directly by deviceId.
      let constraints: MediaStreamConstraints;

      if (targetDeviceId) {
        constraints = {
          video: {
            deviceId: { exact: targetDeviceId },
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 }
          }
        };
      } else {
        // Default to laptop user-facing webcam
        constraints = {
          video: {
            facingMode: 'user',
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 480 }
          }
        };
      }

      let newStream: MediaStream;
      try {
        newStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (firstErr) {
        console.warn('Constrained laptop webcam failed, falling back to unconstrained video: true', firstErr);
        // Fallback directly to generic video (any connected laptop camera)
        newStream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      setStream(newStream);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(e => console.warn('Video playback warning:', e));
        };
      }

      // Populate list of available webcams
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(d => d.kind === 'videoinput');
        setCameras(videoInputs);

        // Identify current camera if not set
        if (videoInputs.length > 0 && !targetDeviceId) {
          const activeTrack = newStream.getVideoTracks()[0];
          const settings = activeTrack ? activeTrack.getSettings() : null;
          const currentId = settings?.deviceId || videoInputs[0].deviceId;
          setSelectedCameraId(currentId);
        }
      } catch (enumErr) {
        console.warn('Could not enumerate webcam devices:', enumErr);
      }
    } catch (err: any) {
      let message = 'Unable to connect to laptop webcam.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = 'Webcam permission was denied or dismissed. Please allow camera access in your browser.';
        console.warn('Laptop webcam permission issue:', err.message || err.name);
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = 'No laptop webcam detected. Check your device settings.';
        console.warn('Laptop webcam not found:', err.message || err.name);
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        message = 'Laptop webcam is currently in use by another application or browser tab.';
        console.warn('Laptop webcam in use:', err.message || err.name);
      } else {
        console.error('Laptop webcam error:', err);
      }
      setError(message);
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopStream(stream);
      setStream(null);
      setError(null);
      setCountdown(null);
    }

    return () => {
      stopStream(stream);
    };
  }, [isOpen]);

  const handleDeviceSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const devId = e.target.value;
    setSelectedCameraId(devId);
    startCamera(devId);
  };

  // Trigger flash & capture
  const executeCapture = () => {
    setFlash(true);
    setTimeout(() => setFlash(false), 200);

    if (videoRef.current && stream && !error) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 800;
      canvas.height = videoRef.current.videoHeight || 600;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Laptop webcams are front-facing: capture directly without horizontal flip so room geometry remains true
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        stopStream(stream);
        onCapture(dataUrl);
        onClose();
      }
    } else {
      // If hardware webcam was unavailable, capture virtual classroom scene
      stopStream(stream);
      onCapture(selectedVirtualFeed);
      onClose();
    }
  };

  const startCountdownAndCapture = () => {
    if (countdown !== null) return;
    setCountdown(3);
    let currentCount = 3;
    const timer = setInterval(() => {
      currentCount -= 1;
      if (currentCount <= 0) {
        clearInterval(timer);
        setCountdown(null);
        // Call outside of state updater
        executeCapture();
      } else {
        setCountdown(currentCount);
      }
    }, 800);
  };

  const handleManualFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = ev => {
        if (ev.target?.result) {
          stopStream(stream);
          onCapture(ev.target.result as string);
          onClose();
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl overflow-hidden relative">
        {/* Flash Effect */}
        {flash && <div className="absolute inset-0 bg-white z-50 animate-out fade-out duration-300" />}

        {/* Hidden fallback file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleManualFile}
          className="hidden"
        />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                  Laptop Webcam Scanner
                </h3>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                  Built-In Camera
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Using your laptop's integrated camera directly (no external apps required)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport Area */}
        <div className="relative aspect-[4/3] max-h-[380px] w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 mb-4 flex items-center justify-center">
          {/* Live Video Feed from Laptop Webcam */}
          {!error && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          )}

          {/* Virtual Camera Feed (shown if webcam has error or is blocked) */}
          {error && (
            <div className="relative w-full h-full">
              <img
                src={selectedVirtualFeed}
                alt="Simulated Classroom Feed"
                className="w-full h-full object-cover brightness-90"
              />
              <div className="absolute top-3 left-3 bg-slate-950/80 border border-amber-500/40 text-amber-300 px-2.5 py-1 rounded-md text-[11px] font-mono flex items-center gap-1.5 shadow">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Simulated Camera Feed Active</span>
              </div>
            </div>
          )}

          {/* HUD Viewfinder Grid */}
          <div className="absolute inset-0 border border-cyan-500/20 pointer-events-none flex flex-col justify-between p-4">
            <div className="flex items-center justify-between">
              <span className="bg-slate-950/70 border border-slate-700 text-cyan-400 font-mono text-[10px] px-2 py-0.5 rounded flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                LAPTOP WEBCAM ● 30FPS
              </span>
              <span className="bg-slate-950/70 border border-slate-700 text-slate-300 font-mono text-[10px] px-2 py-0.5 rounded">
                YOLO SEATING GRID
              </span>
            </div>

            {/* Center Reticle */}
            <div className="self-center flex flex-col items-center gap-1">
              {countdown !== null ? (
                <div className="w-16 h-16 rounded-full bg-emerald-500/90 text-slate-950 flex items-center justify-center font-black text-3xl font-mono animate-ping">
                  {countdown}
                </div>
              ) : (
                <div className="w-12 h-12 border-2 border-dashed border-cyan-400/60 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>FOV: STANDARD WEBCAM</span>
              <span>POINT AT CLASSROOM DESKS</span>
            </div>
          </div>
        </div>

        {/* Error / Fallback Banner if camera was blocked */}
        {error && (
          <div className="bg-slate-950/90 border border-amber-500/30 rounded-xl p-3 mb-4 text-xs font-mono">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-amber-400 font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                {error}
              </span>
              <button
                onClick={() => startCamera(selectedCameraId)}
                className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
              >
                <RefreshCw className="w-3 h-3" /> Retry Laptop Webcam
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-400 text-[11px]">Select Preset Classroom:</span>
              {VIRTUAL_FEEDS.map(feed => (
                <button
                  key={feed.id}
                  onClick={() => setSelectedVirtualFeed(feed.src)}
                  className={`px-2 py-1 rounded text-[11px] transition ${
                    selectedVirtualFeed === feed.src
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {feed.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-3">
          {/* Left tools: Device selector for laptop webcams */}
          <div className="flex items-center gap-2">
            {cameras.length > 1 && (
              <div className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                <Video className="w-3.5 h-3.5 text-cyan-400" />
                <select
                  value={selectedCameraId}
                  onChange={handleDeviceSelect}
                  className="bg-transparent text-slate-200 text-xs font-mono outline-none cursor-pointer max-w-[170px] truncate"
                >
                  {cameras.map((cam, idx) => (
                    <option key={cam.deviceId} value={cam.deviceId} className="bg-slate-900 text-slate-200">
                      {cam.label || `Webcam ${idx + 1} (Laptop)`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={() => startCamera(selectedCameraId)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition"
              title="Refresh Laptop Webcam"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isInitializing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition"
              title="Upload photo from disk"
            >
              <Upload className="w-3.5 h-3.5 text-amber-400" />
              <span>Upload File</span>
            </button>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              Cancel
            </button>

            <button
              onClick={startCountdownAndCapture}
              className="flex items-center gap-2 px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-emerald-950/60 active:scale-95"
            >
              <Camera className="w-4 h-4 stroke-[2.5]" />
              <span>{error ? 'Snap Classroom' : 'Capture from Webcam'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

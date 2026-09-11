import React, { useState, useRef } from 'react';
import { Upload, X, Check, Image as ImageIcon, Sparkles, FolderOpen, ArrowRight } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImageSelected: (imageSrc: string) => void;
  currentImageSrc: string;
}

const PRESET_CLASSROOMS = [
  {
    id: 'sample_classroom',
    title: 'Standard Lecture Hall',
    desc: 'Tiered wooden rows with clear blackboard view',
    src: '/sample_classroom.jpg',
    tag: 'Recommended'
  },
  {
    id: 'auditorium_hall',
    title: 'University Auditorium',
    desc: 'Expansive theater auditorium with wide angle sightlines',
    src: '/auditorium_hall.jpg',
    tag: 'Large Room'
  },
  {
    id: 'seminar_room',
    title: 'Daylight Seminar Room',
    desc: 'Bright classroom with ceiling fan and desk rows',
    src: '/seminar_room.jpg',
    tag: 'Daylight'
  }
];

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onImageSelected,
  currentImageSrc
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string>(currentImageSrc);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    setErrorMsg(null);
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (JPEG, PNG, WEBP).');
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = e => {
      if (e.target?.result) {
        setPreviewSrc(e.target.result as string);
        setSelectedPreset('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
    // reset value so re-selecting same file works
    e.target.value = '';
  };

  const handleConfirm = () => {
    if (previewSrc) {
      onImageSelected(previewSrc);
      onClose();
    } else if (selectedPreset) {
      onImageSelected(selectedPreset);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider">
                Upload Classroom Photograph
              </h3>
              <p className="text-xs text-slate-400">
                Drag & drop your classroom photo or choose from verified classroom setups
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

        {errorMsg && (
          <div className="bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs px-3 py-2 rounded-xl mb-4 font-mono">
            ⚠️ {errorMsg}
          </div>
        )}

        <div className="overflow-y-auto space-y-4 pr-1">
          {/* Drag and Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center ${
              dragActive
                ? 'border-emerald-400 bg-emerald-950/20 scale-[1.01]'
                : previewSrc
                ? 'border-emerald-500/60 bg-slate-950/80'
                : 'border-slate-700 hover:border-slate-500 bg-slate-950/40 hover:bg-slate-950/70'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={handleFileChange}
              className="hidden"
            />

            {previewSrc ? (
              <div className="flex flex-col items-center gap-2">
                <div className="relative w-48 h-28 rounded-lg overflow-hidden border border-emerald-500/40 shadow-lg">
                  <img src={previewSrc} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-emerald-950/20 pointer-events-none" />
                </div>
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-bold">
                  <Check className="w-3.5 h-3.5" />
                  <span>Ready: {fileName || 'Custom Classroom Image'}</span>
                </div>
                <span className="text-[11px] text-slate-400 underline hover:text-slate-200">
                  Click to replace image
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300 shadow-inner">
                  <FolderOpen className="w-6 h-6 text-amber-400" />
                </div>
                <div className="text-sm font-semibold text-slate-200">
                  Click to browse or drag & drop classroom image
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  Supports JPG, PNG, WEBP from phone camera, laptop or files
                </div>
              </div>
            )}
          </div>

          {/* Preset Classroom Scenes */}
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
              <span>Or Choose a Verified Classroom Setup:</span>
              <span className="text-slate-500 text-[10px]">Instant 1-Click Load</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PRESET_CLASSROOMS.map(preset => {
                const isSelected = selectedPreset === preset.src && !previewSrc;
                return (
                  <div
                    key={preset.id}
                    onClick={() => {
                      setSelectedPreset(preset.src);
                      setPreviewSrc(null);
                      setFileName('');
                    }}
                    className={`relative rounded-xl border p-2 cursor-pointer transition overflow-hidden group ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-950/20 ring-2 ring-emerald-500/40'
                        : 'border-slate-800 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-950'
                    }`}
                  >
                    <div className="relative aspect-video rounded-lg overflow-hidden mb-2 bg-slate-900">
                      <img
                        src={preset.src}
                        alt={preset.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-950/80 text-emerald-400 border border-slate-800">
                        {preset.tag}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-white truncate">{preset.title}</div>
                    <div className="text-[10px] text-slate-400 line-clamp-1">{preset.desc}</div>

                    {isSelected && (
                      <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-950/50 active:scale-95"
          >
            <span>Apply Classroom Image</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

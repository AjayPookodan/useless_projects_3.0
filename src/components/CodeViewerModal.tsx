import React, { useState } from 'react';
import { Code2, X, Copy, Check, Terminal, FileCode } from 'lucide-react';

interface CodeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FILES: Record<string, string> = {
  'app.py': `import streamlit as st
import json, time, os
from PIL import Image
from ui.dashboard import render_header, render_sidebar, render_best_seat_card, render_metrics_grid, render_worst_seat_card, render_rankings_table
from ui.visualization import draw_classroom_visualization
from scoring.scorer import rank_all_seats, get_best_and_worst
from ai.detector import YOLODetector
from ai.processor import process_detections_to_classroom

st.set_page_config(page_title="Best Seat Detector", page_icon="🎯", layout="wide")

def main():
    render_header()
    controls = render_sidebar()
    # Image loading, YOLO detection, scoring & visualization
    # Run: streamlit run app.py`,

  'scoring/metrics.py': `import math
from utils.geometry import distance, normalize

def calculate_board_visibility(seat, board, max_dist):
    # Closer & laterally aligned with board
    d = distance(seat, board)
    return round(0.65 * normalize(d, 0, max_dist, invert=True) + 0.35 * normalize(abs(seat["x"] - board["x"]), 0, max_dist * 0.6, invert=True), 2)

def calculate_teacher_safety(seat, teacher, max_dist):
    return round(normalize(distance(seat, teacher), 0, max_dist, invert=False), 2)

def calculate_phone_safety(seat, teacher, occupied_seats, max_dist):
    # Human shields between teacher and seat
    base = calculate_teacher_safety(seat, teacher, max_dist)
    shields = sum(1 for occ in occupied_seats if teacher["y"] < occ["y"] < seat["y"] and abs(occ["x"] - seat["x"]) < 120)
    return round(min(100.0, base * 0.75 + min(shields * 8.5, 25.0)), 2)`,

  'scoring/profiles.py': `PROFILES = {
    "Balanced Student": {"weights": {"board_visibility": 0.2, "teacher_safety": 0.2, "fan_exposure": 0.15, "friend_proximity": 0.15, "escape_probability": 0.15, "comfort": 0.15}},
    "Topper": {"weights": {"board_visibility": 0.40, "teacher_visibility": 0.25, "teacher_safety": 0.05, "fan_exposure": 0.10, "comfort": 0.10}},
    "Sleeper": {"weights": {"teacher_safety": 0.35, "fan_exposure": 0.25, "sleep_potential": 0.20, "escape_probability": 0.10, "board_visibility": 0.05}},
    "Phone Addict": {"weights": {"teacher_safety": 0.35, "phone_safety": 0.35, "escape_probability": 0.15, "fan_exposure": 0.05}},
    "Backbencher": {"weights": {"teacher_safety": 0.30, "escape_probability": 0.25, "phone_safety": 0.20, "friend_proximity": 0.20}},
    "Socializer": {"weights": {"friend_proximity": 0.40, "comfort": 0.20, "escape_probability": 0.15, "teacher_safety": 0.15}}
}`,

  'ai/detector.py': `from ultralytics import YOLO

class YOLODetector:
    def __init__(self, model_path="yolov8n.pt"):
        self.model = YOLO(model_path)

    def detect(self, image, conf_threshold=0.25):
        results = self.model(image, conf=conf_threshold)
        # returns [{ "label": "chair", "confidence": 0.93, "bbox": [...], "center": [...] }]`,

  'requirements.txt': `ultralytics>=8.0.0
opencv-python>=4.8.0
numpy>=1.24.0
streamlit>=1.28.0
pillow>=10.0.0
pandas>=2.0.0
scipy>=1.11.0`
};

export const CodeViewerModal: React.FC<CodeViewerModalProps> = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState<string>('app.py');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(FILES[selectedFile] || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Python Streamlit Hackathon Codebase
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                Full modular architecture matching prompt specifications
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* How to run command bar */}
        <div className="bg-slate-950/60 border-b border-slate-800 px-6 py-2.5 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2 text-emerald-400">
            <Terminal className="w-4 h-4" />
            <span>Launch command:</span>
            <code className="bg-slate-900 px-2 py-0.5 rounded text-white border border-slate-800">
              streamlit run app.py
            </code>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>

        {/* Body: Sidebar with file list + code display */}
        <div className="flex-1 flex overflow-hidden">
          {/* File sidebar */}
          <div className="w-56 bg-slate-950/90 border-r border-slate-800 p-3 space-y-1 overflow-y-auto">
            <div className="text-[10px] font-mono uppercase text-slate-500 font-bold px-2 py-1">
              Project Structure
            </div>
            {Object.keys(FILES).map(fileName => (
              <button
                key={fileName}
                onClick={() => setSelectedFile(fileName)}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-mono text-left transition ${
                  selectedFile === fileName
                    ? 'bg-purple-600/30 text-purple-300 font-bold border border-purple-500/40'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{fileName}</span>
              </button>
            ))}
          </div>

          {/* Code Viewer */}
          <div className="flex-1 p-4 bg-slate-950 overflow-auto font-mono text-xs text-slate-300 leading-relaxed">
            <pre>{FILES[selectedFile]}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

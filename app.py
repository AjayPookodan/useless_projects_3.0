"""
Best Seat Detector - Streamlit Main Entry Point
An over-engineered AI seating optimization system solving the most trivial classroom problem.
"""

import streamlit as st
import json
import time
from PIL import Image
import os

from ui.dashboard import render_header, render_sidebar, render_best_seat_card, render_metrics_grid, render_worst_seat_card, render_rankings_table
from ui.visualization import draw_classroom_visualization
from scoring.scorer import rank_all_seats, get_best_and_worst
from ai.detector import YOLODetector
from ai.processor import process_detections_to_classroom

st.set_page_config(page_title="Best Seat Detector", page_icon="🎯", layout="wide")

def load_sample_data():
    sample_path = "data/sample_data.json"
    if os.path.exists(sample_path):
        with open(sample_path, "r") as f:
            return json.load(f)
    return {}

def run_demo_scan():
    steps = [
        "Detecting classroom geometry...",
        "Finding candidate chairs...",
        "Detecting professor & eye-contact vectors...",
        "Measuring chalkboard focal alignment...",
        "Calculating ceiling fan CFD turbulence...",
        "Estimating rapid eye movement (REM) sleep potential...",
        "Calculating teacher interrogation probability...",
        "Running redundant aerospace optimization matrix...",
        "Consulting absolutely zero pedagogy experts...",
        "Finalizing mathematically unassailable recommendation!"
    ]
    progress_bar = st.progress(0)
    status_text = st.empty()
    for i, step in enumerate(steps):
        status_text.markdown(f"🔬 **AI Scan:** {step}")
        progress_bar.progress((i + 1) / len(steps))
        time.sleep(0.12)
    status_text.markdown("✅ **Optimization Matrix Converged!**")
    time.sleep(0.2)
    progress_bar.empty()
    status_text.empty()

def main():
    render_header()
    controls = render_sidebar()
    
    # 1. Load Classroom Image
    image = None
    if controls["input_source"] == "Use Sample Classroom":
        sample_img_path = "data/classroom.jpg"
        if os.path.exists(sample_img_path):
            image = Image.open(sample_img_path)
        else:
            image = Image.new("RGB", (800, 600), color=(240, 243, 246))
    elif controls["input_source"] == "Upload Image":
        uploaded_file = st.sidebar.file_uploader("Upload Classroom Photo", type=["jpg", "jpeg", "png", "webp"])
        if uploaded_file:
            image = Image.open(uploaded_file)
    elif controls["input_source"] == "Webcam / Camera":
        camera_file = st.sidebar.camera_input("Capture Classroom")
        if camera_file:
            image = Image.open(camera_file)

    if image is None:
        st.info("👈 Please select a classroom input source in the sidebar (or click 'Use Sample Classroom' for an instant demo).")
        return

    # 2. Process Classroom Data
    sample_data = load_sample_data()
    
    # Check if YOLO can detect or fallback to sample layout
    detector = YOLODetector()
    classroom_data = None
    
    if detector.loaded and controls["input_source"] != "Use Sample Classroom":
        with st.spinner("Analyzing camera pixels with YOLO..."):
            detections = detector.detect(image)
            if detections:
                classroom_data = process_detections_to_classroom(detections, default_landmarks=sample_data)
    
    # Fallback to sample data if detection is empty or in sample mode
    if not classroom_data or not classroom_data.get("seats"):
        if controls["input_source"] != "Use Sample Classroom" and not detector.loaded:
            st.warning("⚠️ AI YOLO model running in heuristic fallback mode. Using verified classroom spatial matrix.")
        classroom_data = sample_data

    # Scan Trigger
    col1, col2 = st.columns([1, 4])
    with col1:
        scan_clicked = st.button("🚀 Calculate Best Seat", type="primary", use_container_width=True)

    if scan_clicked and controls["demo_mode"]:
        run_demo_scan()

    # 3. Score and Rank Seats
    ranked_seats = rank_all_seats(classroom_data, controls["profile"])
    best_seat, worst_seat = get_best_and_worst(ranked_seats)

    # 4. Display Visualization and Results
    st.markdown("---")
    vis_col, res_col = st.columns([1.2, 1])

    with vis_col:
        st.subheader("🗺️ Spatial Analysis Grid")
        landmarks = {
            "teacher": classroom_data.get("teacher"),
            "board": classroom_data.get("board"),
            "fan": classroom_data.get("fan"),
            "exit": classroom_data.get("exit")
        }
        annotated_img = draw_classroom_visualization(image, ranked_seats, best_seat, worst_seat, landmarks)
        st.image(annotated_img, use_container_width=True)
        st.caption("🟢 Green: Mathematically Optimal | 🟡 Yellow: Available | 🔴 Red: Occupied")

    with res_col:
        if best_seat:
            render_best_seat_card(best_seat)
            st.subheader("🔬 Absurdly Precise Metrics")
            render_metrics_grid(best_seat.get("metrics", {}))

    # 5. Worst Seat Analysis
    if controls["show_worst"] and worst_seat:
        render_worst_seat_card(worst_seat)

    # 6. Complete Leaderboard
    st.markdown("---")
    render_rankings_table(ranked_seats)

if __name__ == "__main__":
    main()

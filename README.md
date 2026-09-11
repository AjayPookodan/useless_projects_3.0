# 🎯 Best Seat Detector

> **"Why make such an important decision yourself when AI can do it?"**

An intentionally over-engineered hackathon project designed to solve an extremely trivial problem: **"Which seat should I sit in?"**

The application uses computer vision, spatial geometry, dynamic student profiling, and multi-factor weighted scoring algorithms to scan a classroom and determine the mathematically "best" seat.

---

## 🚀 Key Features

1. **AI Object & Seat Detection**:
   - Detects chairs, persons, and classroom elements using Ultralytics YOLOv8.
   - Calculates bounding box IoU overlap to determine seat occupancy (`Available` vs `Occupied`).
   - Bulletproof manual fallback mode so computer vision failures never ruin a live demo.

2. **6 Dynamic Student Archetypes**:
   - **Balanced Student**: Optimal trade-off between vision, safety, and comfort.
   - **Topper**: Prioritizes front-row chalkboard visibility and professor eye contact.
   - **Sleeper**: Maximizes teacher distance, stealth corners, and ceiling fan airflow.
   - **Phone Addict**: Seeks human shields, zero teacher line-of-sight, and rapid escape paths.
   - **Backbencher**: Max authority avoidance, close exit proximity, and friend clusters.
   - **Socializer**: Prioritizes proximity to friends and group banter radius.

3. **Absurdly Precise NASA-Grade Metrics**:
   - Board Visibility (%)
   - Teacher Safety (%)
   - Fan Exposure (%)
   - Phone Safety & Human Shield Index (%)
   - REM Sleep Potential (%)
   - Escape Sprint Probability (%)
   - Teacher Question Probability (%)
   - Detection Risk (%)
   - Boredom Risk (%)

4. **Interactive Visualization**:
   - 🟢 **Green Halo**: Top-ranked optimal chair
   - 🟡 **Yellow**: Available candidate chairs with live scores
   - 🔴 **Red**: Occupied chairs
   - Custom markers for **Teacher Podium**, **Board**, **Ceiling Fan**, and **Exit**.

5. **Disaster Avoidance: Worst Seat Analyzer (💀)**:
   - Identifies the most dangerous chair in the room (e.g. *"You might as well sit on the teacher's desk."*)

6. **Animated AI Demo Mode**:
   - Simulated 10-step mission control telemetry scan with radar animations.

---

## 🛠️ Project Structure

```text
best-seat-detector/
├── app.py                   # Streamlit main entry point & telemetry loop
├── requirements.txt         # Dependencies (ultralytics, streamlit, opencv, etc.)
├── README.md                # Documentation & hackathon pitch
│
├── ai/
│   ├── __init__.py
│   ├── detector.py          # YOLOv8 object detection wrapper
│   └── processor.py         # Chair extraction & IoU occupancy engine
│
├── scoring/
│   ├── __init__.py
│   ├── scorer.py            # Weighted ranking engine & hilarious verdicts
│   ├── metrics.py           # Mathematical distance & heuristic metrics
│   └── profiles.py          # Student personality profile weights
│
├── ui/
│   ├── __init__.py
│   ├── dashboard.py         # Streamlit layouts, cards, and tables
│   └── visualization.py     # Pillow canvas overlay renderer
│
├── utils/
│   ├── __init__.py
│   └── geometry.py          # Euclidean distance, IoU overlap, normalization
│
├── data/
│   ├── sample_data.json     # Verified classroom spatial coordinates
│   └── classroom.jpg        # High-resolution sample lecture hall photo
│
└── models/
    └── README.md            # YOLO weights guide
```

---

## 💻 Local Installation & Running

### 1. Create and Activate Virtual Environment

```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Launch Streamlit Application

```bash
streamlit run app.py
```

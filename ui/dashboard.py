"""
Streamlit UI dashboard components for Best Seat Detector.
Implements the mission-control seating layout, result cards, and rankings.
"""

import streamlit as st
import pandas as pd
from typing import Dict, Any, List
from scoring.profiles import PROFILES

def render_header():
    st.markdown("""
    <div style="text-align: center; margin-bottom: 2rem;">
        <h1 style="font-size: 2.5rem; margin-bottom: 0.25rem;">🎯 BEST SEAT DETECTOR</h1>
        <p style="font-size: 1.1rem; color: #64748b; margin-top: 0;">
            <em>An over-engineered AI seating optimization system solving the most trivial classroom problem.</em>
        </p>
    </div>
    """, unsafe_allow_html=True)

def render_sidebar():
    st.sidebar.title("🎛️ Mission Control")
    
    st.sidebar.subheader("1. Student Profile")
    profile_names = list(PROFILES.keys())
    selected_profile = st.sidebar.selectbox("Select Personality:", profile_names, index=0)
    profile_info = PROFILES[selected_profile]
    st.sidebar.caption(f"**Archetype:** {profile_info['personality']}")
    st.sidebar.info(profile_info['description'])
    
    st.sidebar.markdown("---")
    st.sidebar.subheader("2. Classroom Input")
    input_source = st.sidebar.radio("Input Source:", ["Use Sample Classroom", "Upload Image", "Webcam / Camera"])
    
    st.sidebar.markdown("---")
    st.sidebar.subheader("3. Mode & Options")
    demo_mode = st.sidebar.checkbox("🚀 Demo Mode (Animated Scanning)", value=True)
    show_worst = st.sidebar.checkbox("💀 Show Worst Seat Analysis", value=True)
    manual_override = st.sidebar.checkbox("🛠️ Manual Seat Fallback / Override", value=False)
    
    return {
        "profile": selected_profile,
        "input_source": input_source,
        "demo_mode": demo_mode,
        "show_worst": show_worst,
        "manual_override": manual_override
    }

def render_best_seat_card(best_seat: Dict[str, Any]):
    score = best_seat.get("final_score", 0.0)
    s_id = best_seat.get("seat_id", "?")
    personality = best_seat.get("personality", "The Optimus")
    verdict = best_seat.get("funny_verdict", "SIT HERE.")
    
    st.markdown(f"""
    <div style="
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        border: 2px solid #22c55e;
        border-radius: 16px;
        padding: 24px;
        text-align: center;
        color: white;
        box-shadow: 0 10px 25px -5px rgba(34, 197, 94, 0.2);
        margin-bottom: 24px;
    ">
        <span style="font-size: 0.9rem; letter-spacing: 2px; color: #4ade80; font-weight: bold; text-transform: uppercase;">
            🏆 MATHEMATICALLY VERIFIED OPTIMUM
        </span>
        <h1 style="font-size: 4rem; margin: 8px 0; color: #22c55e; font-family: monospace;">
            SEAT #{s_id}
        </h1>
        <div style="font-size: 1.5rem; color: #f8fafc; margin-bottom: 8px; font-family: monospace;">
            <b>{score:.2f}</b> <span style="font-size: 1rem; color: #94a3b8;">/ 100.00</span>
        </div>
        <div style="display: inline-block; background: #22c55e; color: #022c22; font-weight: 800; padding: 6px 16px; border-radius: 20px; font-size: 1.1rem; margin-bottom: 16px;">
            VERDICT: SIT HERE.
        </div>
        <p style="font-style: italic; color: #cbd5e1; font-size: 1.05rem; margin-top: 8px;">
            "{verdict}"
        </p>
        <div style="color: #64748b; font-size: 0.85rem;">
            Designation: <b>{personality}</b>
        </div>
    </div>
    """, unsafe_allow_html=True)

def render_metrics_grid(metrics: Dict[str, float]):
    cols = st.columns(3)
    
    items = [
        ("📋 Board Visibility", f"{metrics.get('board_visibility', 0.0):.2f}%", "#3b82f6"),
        ("🛡️ Teacher Safety", f"{metrics.get('teacher_safety', 0.0):.2f}%", "#10b981"),
        ("💨 Fan Exposure", f"{metrics.get('fan_exposure', 0.0):.2f}%", "#06b6d4"),
        ("📱 Phone Safety", f"{metrics.get('phone_safety', 0.0):.2f}%", "#8b5cf6"),
        ("💤 Sleep Potential", f"{metrics.get('sleep_potential', 0.0):.2f}%", "#6366f1"),
        ("🚪 Escape Probability", f"{metrics.get('escape_probability', 0.0):.2f}%", "#f59e0b"),
        ("👥 Friend Proximity", f"{metrics.get('friend_proximity', 0.0):.2f}%", "#ec4899"),
        ("❓ Question Probability", f"{metrics.get('question_probability', 0.0):.2f}%", "#ef4444"),
        ("⚠️ Teacher Detection Risk", f"{metrics.get('teacher_detection_risk', 0.0):.2f}%", "#f97316"),
    ]
    
    for i, (label, val, color) in enumerate(items):
        with cols[i % 3]:
            st.markdown(f"""
            <div style="
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 10px;
                padding: 12px;
                margin-bottom: 12px;
            ">
                <div style="font-size: 0.85rem; color: #475569;">{label}</div>
                <div style="font-size: 1.35rem; font-weight: 700; color: {color}; font-family: monospace;">{val}</div>
            </div>
            """, unsafe_allow_html=True)

def render_worst_seat_card(worst_seat: Dict[str, Any]):
    score = worst_seat.get("final_score", 0.0)
    s_id = worst_seat.get("seat_id", "?")
    m = worst_seat.get("metrics", {})
    verdict = worst_seat.get("funny_verdict", "You might as well sit on the teacher's desk.")
    
    st.markdown(f"""
    <div style="
        background: #450a0a;
        border: 2px solid #ef4444;
        border-radius: 14px;
        padding: 20px;
        color: #fef2f2;
        margin-top: 20px;
    ">
        <h3 style="color: #f87171; margin-top: 0;">💀 DISASTER AVOIDANCE: WORST SEAT #{s_id}</h3>
        <p style="font-size: 1.2rem; font-family: monospace; font-weight: bold; color: #ef4444;">
            Score: {score:.2f} / 100.00
        </p>
        <ul style="line-height: 1.8;">
            <li>❌ Question Probability: <b>{m.get('question_probability', 0):.2f}%</b> (Extremely Lethal)</li>
            <li>❌ Teacher Detection Risk: <b>{m.get('teacher_detection_risk', 0):.2f}%</b></li>
            <li>❌ Fan Exposure: <b>{m.get('fan_exposure', 0):.2f}%</b></li>
            <li>❌ Escape Probability: <b>{m.get('escape_probability', 0):.2f}%</b></li>
        </ul>
        <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 8px; font-style: italic;">
            <b>VERDICT:</b> "{verdict}"
        </div>
    </div>
    """, unsafe_allow_html=True)

def render_rankings_table(ranked_seats: List[Dict[str, Any]]):
    st.subheader("📊 Complete Seat Leaderboard")
    data = []
    for s in ranked_seats:
        m = s.get("metrics", {})
        data.append({
            "Rank": f"{s.get('medal', '')} {s.get('rank', '')}",
            "Seat": f"#{s.get('seat_id')}",
            "Status": "Occupied" if s.get("occupied") else "Available",
            "Score": f"{s.get('final_score', 0):.2f}",
            "Verdict": s.get("verdict", ""),
            "Personality": s.get("personality", ""),
            "Board": f"{m.get('board_visibility', 0):.1f}%",
            "Teacher Safety": f"{m.get('teacher_safety', 0):.1f}%",
            "Phone Safety": f"{m.get('phone_safety', 0):.1f}%",
            "Sleep": f"{m.get('sleep_potential', 0):.1f}%",
            "Escape": f"{m.get('escape_probability', 0):.1f}%"
        })
    df = pd.DataFrame(data)
    st.dataframe(df, use_container_width=True, hide_index=True)

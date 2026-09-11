"""
Scoring and ranking engine for Best Seat Detector.
Ranks all available seats, calculates final weighted scores, and generates verdicts.
"""

from typing import Dict, Any, List, Tuple
from scoring.profiles import PROFILES
from scoring import metrics
import random

FUNNY_VERDICTS_BEST = [
    "Seat #{id} is statistically suspiciously good.",
    "The AI has determined that this is the least regrettable chair in the room.",
    "Your survival probability is unusually high here.",
    "Teacher interaction probability is within acceptable limits.",
    "Congratulations. You have optimized sitting.",
    "According to our highly questionable mathematics, you should sit here.",
    "This seat provides the optimal balance between education and avoiding education.",
    "Our neural network certifies this chair as an elite refuge.",
    "Positioned with aerospace-grade stealth from the chalkboard.",
    "Maximum ventilation detected. Your grades might suffer, but your posture will thrive."
]

FUNNY_VERDICTS_WORST = [
    "You might as well sit on the teacher's desk.",
    "Sitting here is a legally recognized hazard to your GPA.",
    "Zero airflow, 99.8% eye contact with authority. Run.",
    "This seat exists purely as a psychological punishment.",
    "If you sit here, you will be called on within 4 minutes.",
    "The Bermuda Triangle of the lecture hall."
]

PERSONALITY_TITLES = [
    "The Strategist", "The Academic", "The Menace", "The Regret",
    "The Phantom", "The Sleeper Agent", "The Human Shield", "The Frontline Defender",
    "The Escape Artist", "The Neutralist", "The Chatterbox", "The Lone Wolf"
]

def score_seat(seat: Dict[str, Any], classroom_data: Dict[str, Any], profile_name: str = "Balanced Student") -> Dict[str, Any]:
    """Calculates all metrics and final score for a single seat."""
    profile = PROFILES.get(profile_name, PROFILES["Balanced Student"])
    weights = profile["weights"]
    
    teacher = classroom_data.get("teacher", {})
    board = classroom_data.get("board", {})
    fan = classroom_data.get("fan", {})
    exit_loc = classroom_data.get("exit", {})
    friends = classroom_data.get("friends", [])
    occupied_seats = [s for s in classroom_data.get("seats", []) if s.get("occupied", False)]
    
    # Calculate classroom bounds to determine max Euclidean distance
    all_seats = classroom_data.get("seats", [])
    if all_seats:
        max_x = max(s["x"] for s in all_seats)
        max_y = max(s["y"] for s in all_seats)
        max_dist = max(500.0, (max_x ** 2 + max_y ** 2) ** 0.5)
    else:
        max_dist = 600.0

    b_vis = metrics.calculate_board_visibility(seat, board, max_dist)
    t_safe = metrics.calculate_teacher_safety(seat, teacher, max_dist)
    t_vis = metrics.calculate_teacher_visibility(seat, teacher, max_dist)
    f_exp = metrics.calculate_fan_exposure(seat, fan, max_dist)
    p_safe = metrics.calculate_phone_safety(seat, teacher, occupied_seats, max_dist)
    s_pot = metrics.calculate_sleep_potential(seat, teacher, fan, max_dist)
    e_prob = metrics.calculate_escape_probability(seat, exit_loc, max_dist)
    fr_prox = metrics.calculate_friend_proximity(seat, friends, max_dist)
    comfort = metrics.calculate_comfort(seat, fan, teacher, exit_loc, max_dist)
    q_prob = metrics.calculate_question_probability(seat, teacher, max_dist)
    t_risk = metrics.calculate_teacher_detection_risk(seat, teacher, max_dist)
    b_risk = metrics.calculate_boredom_risk(seat, board, friends, max_dist)

    metric_values = {
        "board_visibility": b_vis,
        "teacher_safety": t_safe,
        "teacher_visibility": t_vis,
        "fan_exposure": f_exp,
        "phone_safety": p_safe,
        "sleep_potential": s_pot,
        "escape_probability": e_prob,
        "friend_proximity": fr_prox,
        "comfort": comfort,
    }

    # Calculate weighted total
    total_weight = sum(weights.values())
    weighted_sum = sum(metric_values.get(k, 50.0) * w for k, w in weights.items())
    final_score = round(weighted_sum / total_weight, 2) if total_weight > 0 else 50.00

    # Pick consistent personality based on seat id
    p_idx = (seat.get("id", 1) * 7) % len(PERSONALITY_TITLES)
    personality = PERSONALITY_TITLES[p_idx]

    return {
        "seat_id": seat.get("id"),
        "x": seat.get("x"),
        "y": seat.get("y"),
        "label": seat.get("label", f"Seat #{seat.get('id')}"),
        "occupied": seat.get("occupied", False),
        "final_score": final_score,
        "personality": personality,
        "metrics": {
            "board_visibility": b_vis,
            "teacher_safety": t_safe,
            "teacher_visibility": t_vis,
            "fan_exposure": f_exp,
            "phone_safety": p_safe,
            "sleep_potential": s_pot,
            "escape_probability": e_prob,
            "friend_proximity": fr_prox,
            "comfort": comfort,
            "question_probability": q_prob,
            "teacher_detection_risk": t_risk,
            "boredom_risk": b_risk
        }
    }

def rank_all_seats(classroom_data: Dict[str, Any], profile_name: str = "Balanced Student") -> List[Dict[str, Any]]:
    """Calculates scores for all seats and returns them ranked (available first, highest score first)."""
    seats = classroom_data.get("seats", [])
    scored_seats = [score_seat(s, classroom_data, profile_name) for s in seats]
    
    # Sort available seats by final_score descending
    available = sorted([s for s in scored_seats if not s["occupied"]], key=lambda x: x["final_score"], reverse=True)
    occupied = sorted([s for s in scored_seats if s["occupied"]], key=lambda x: x["final_score"], reverse=True)
    
    for rank, s in enumerate(available, 1):
        s["rank"] = rank
        if rank == 1:
            s["verdict"] = "SIT HERE"
            s["medal"] = "🥇"
        elif rank == 2:
            s["verdict"] = "Very Good"
            s["medal"] = "🥈"
        elif rank == 3:
            s["verdict"] = "Acceptable"
            s["medal"] = "🥉"
        elif rank <= len(available) - 2:
            s["verdict"] = "Risky"
            s["medal"] = f"#{rank}"
        else:
            s["verdict"] = "Why?"
            s["medal"] = f"#{rank}"
            
    for rank, s in enumerate(occupied, len(available) + 1):
        s["rank"] = rank
        s["verdict"] = "OCCUPIED"
        s["medal"] = "⛔"
        
    return available + occupied

def get_best_and_worst(ranked_seats: List[Dict[str, Any]]) -> Tuple[Dict[str, Any], Dict[str, Any]]:
    """Returns the top available seat and the worst available seat."""
    available = [s for s in ranked_seats if not s["occupied"]]
    if not available:
        # Fallback to any seat
        return ranked_seats[0] if ranked_seats else {}, ranked_seats[-1] if ranked_seats else {}
    
    best = available[0]
    worst = available[-1]
    
    # Attach funny verdicts
    best_verdict_tmpl = random.choice(FUNNY_VERDICTS_BEST)
    best["funny_verdict"] = best_verdict_tmpl.replace("{id}", str(best["seat_id"]))
    
    worst_verdict_tmpl = random.choice(FUNNY_VERDICTS_WORST)
    worst["funny_verdict"] = worst_verdict_tmpl
    
    return best, worst

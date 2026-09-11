"""
Calculates individual metrics for classroom seats in Best Seat Detector.
Each metric returns a score from 0.00 to 100.00 with mathematical precision.
"""

import math
from typing import Dict, Any, List
from utils.geometry import distance, normalize

def calculate_board_visibility(seat: Dict[str, Any], board: Dict[str, Any], max_dist: float) -> float:
    """Closer and aligned with board center gives a higher score."""
    if not board:
        return 75.00
    d = distance(seat, board)
    dist_score = normalize(d, 0, max_dist, invert=True)
    
    # Angular penalty: seats right in front of board have higher visibility
    lateral_offset = abs(seat["x"] - board["x"])
    offset_penalty = normalize(lateral_offset, 0, max_dist * 0.6, invert=True)
    
    score = 0.65 * dist_score + 0.35 * offset_penalty
    return round(score, 2)

def calculate_teacher_safety(seat: Dict[str, Any], teacher: Dict[str, Any], max_dist: float) -> float:
    """Farther from the teacher gives a higher safety score."""
    if not teacher:
        return 80.00
    d = distance(seat, teacher)
    score = normalize(d, 0, max_dist, invert=False)
    return round(score, 2)

def calculate_teacher_visibility(seat: Dict[str, Any], teacher: Dict[str, Any], max_dist: float) -> float:
    """Direct line of sight to teacher (preferred by Topper)."""
    if not teacher:
        return 50.00
    d = distance(seat, teacher)
    score = normalize(d, 0, max_dist, invert=True)
    return round(score, 2)

def calculate_fan_exposure(seat: Dict[str, Any], fan: Dict[str, Any], max_dist: float) -> float:
    """Closer to the fan gives maximum cooling and air circulation."""
    if not fan:
        return 50.00
    d = distance(seat, fan)
    score = normalize(d, 0, max_dist * 0.7, invert=True)
    return round(score, 2)

def calculate_phone_safety(seat: Dict[str, Any], teacher: Dict[str, Any], occupied_seats: List[Dict[str, Any]], max_dist: float) -> float:
    """
    Considers teacher distance plus human shields (occupied seats directly in front).
    """
    safety_base = calculate_teacher_safety(seat, teacher, max_dist)
    
    # Count human shields: occupied seats between teacher (y=0 approx) and this seat
    shields = 0
    if teacher:
        for occ in occupied_seats:
            if occ.get("id") != seat.get("id"):
                # Check if this person is between teacher and seat
                if teacher["y"] < occ["y"] < seat["y"] and abs(occ["x"] - seat["x"]) < 120:
                    shields += 1
    
    shield_boost = min(shields * 8.5, 25.0)
    score = min(100.0, safety_base * 0.75 + shield_boost)
    return round(score, 2)

def calculate_sleep_potential(seat: Dict[str, Any], teacher: Dict[str, Any], fan: Dict[str, Any], max_dist: float) -> float:
    """Based on teacher distance (safety), fan breeze, and low disturbance."""
    t_safety = calculate_teacher_safety(seat, teacher, max_dist)
    fan_score = calculate_fan_exposure(seat, fan, max_dist)
    
    # Back corners get sleep stealth bonus
    corner_bonus = 10.0 if (seat["x"] < 150 or seat["x"] > 600) and seat["y"] > 350 else 0.0
    
    score = 0.50 * t_safety + 0.35 * fan_score + 0.15 * corner_bonus
    return round(min(score, 100.0), 2)

def calculate_escape_probability(seat: Dict[str, Any], exit_loc: Dict[str, Any], max_dist: float) -> float:
    """Closer to classroom exit door gives higher sprint probability."""
    if not exit_loc:
        return 60.00
    d = distance(seat, exit_loc)
    score = normalize(d, 0, max_dist * 0.8, invert=True)
    return round(score, 2)

def calculate_friend_proximity(seat: Dict[str, Any], friends: List[Dict[str, Any]], max_dist: float) -> float:
    """Average proximity to tagged friends."""
    if not friends:
        return 50.00
    dists = [distance(seat, f) for f in friends]
    avg_d = sum(dists) / len(dists)
    score = normalize(avg_d, 0, max_dist * 0.6, invert=True)
    return round(score, 2)

def calculate_comfort(seat: Dict[str, Any], fan: Dict[str, Any], teacher: Dict[str, Any], exit_loc: Dict[str, Any], max_dist: float) -> float:
    """Heuristic combining thermal comfort, space from teacher pressure, and exit flow."""
    fan_score = calculate_fan_exposure(seat, fan, max_dist)
    t_safety = calculate_teacher_safety(seat, teacher, max_dist)
    escape = calculate_escape_probability(seat, exit_loc, max_dist)
    
    score = 0.40 * fan_score + 0.35 * t_safety + 0.25 * escape
    return round(score, 2)

def calculate_question_probability(seat: Dict[str, Any], teacher: Dict[str, Any], max_dist: float) -> float:
    """
    Inverse of teacher safety: high chance in front row and directly facing teacher.
    """
    if not teacher:
        return 25.00
    t_safety = calculate_teacher_safety(seat, teacher, max_dist)
    prob = 100.00 - t_safety
    
    # Extra eye contact factor
    if abs(seat["x"] - teacher["x"]) < 100:
        prob = min(98.5, prob * 1.25)
    return round(max(2.10, min(prob, 99.45)), 2)

def calculate_teacher_detection_risk(seat: Dict[str, Any], teacher: Dict[str, Any], max_dist: float) -> float:
    """Probability of teacher catching student doing extracurricular activities."""
    q_prob = calculate_question_probability(seat, teacher, max_dist)
    return round(max(1.85, q_prob * 0.82), 2)

def calculate_boredom_risk(seat: Dict[str, Any], board: Dict[str, Any], friends: List[Dict[str, Any]], max_dist: float) -> float:
    """High if far from board and far from friends."""
    b_vis = calculate_board_visibility(seat, board, max_dist)
    f_prox = calculate_friend_proximity(seat, friends, max_dist)
    risk = 100.0 - (0.5 * b_vis + 0.5 * f_prox)
    return round(max(5.0, min(risk, 95.0)), 2)

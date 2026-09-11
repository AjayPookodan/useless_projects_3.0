"""
Student profiles defining the dynamic scoring weights for Best Seat Detector.
"""

PROFILES = {
    "Balanced Student": {
        "description": "Equally values academic access, comfort, and peace of mind.",
        "weights": {
            "board_visibility": 0.20,
            "teacher_safety": 0.20,
            "fan_exposure": 0.15,
            "friend_proximity": 0.15,
            "escape_probability": 0.15,
            "comfort": 0.15,
        },
        "personality": "The Diplomat"
    },
    "Topper": {
        "description": "Obsessed with board visibility, teacher eye contact, and academic supremacy.",
        "weights": {
            "board_visibility": 0.40,
            "teacher_safety": 0.05,  # Wants to be close to teacher, not safe from them
            "teacher_visibility": 0.25,
            "fan_exposure": 0.10,
            "friend_proximity": 0.05,
            "escape_probability": 0.05,
            "comfort": 0.10,
        },
        "personality": "The Front-Row General"
    },
    "Sleeper": {
        "description": "Requires maximum teacher distance, optimal breeze, and stealth conditions.",
        "weights": {
            "board_visibility": 0.05,
            "teacher_safety": 0.35,
            "fan_exposure": 0.25,
            "sleep_potential": 0.20,
            "friend_proximity": 0.05,
            "escape_probability": 0.10,
        },
        "personality": "The Hibernator"
    },
    "Phone Addict": {
        "description": "Needs zero teacher line-of-sight and high human shields for screen secrecy.",
        "weights": {
            "board_visibility": 0.05,
            "teacher_safety": 0.35,
            "phone_safety": 0.35,
            "escape_probability": 0.15,
            "fan_exposure": 0.05,
            "comfort": 0.05,
        },
        "personality": "The Screen Ninja"
    },
    "Backbencher": {
        "description": "Maximum distance from authority, nearest to the door, surrounded by conspirators.",
        "weights": {
            "board_visibility": 0.05,
            "teacher_safety": 0.30,
            "phone_safety": 0.20,
            "escape_probability": 0.25,
            "friend_proximity": 0.20,
        },
        "personality": "The Outlaw"
    },
    "Socializer": {
        "description": "Wants to be right in the middle of friends with high chatter radius.",
        "weights": {
            "board_visibility": 0.10,
            "teacher_safety": 0.15,
            "friend_proximity": 0.40,
            "comfort": 0.20,
            "escape_probability": 0.15,
        },
        "personality": "The Gossip Catalyst"
    }
}

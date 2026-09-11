"""
Processes raw YOLO detections into structured classroom seating data.
Determines seat occupancy based on chair-person bounding box overlap.
"""

from typing import List, Dict, Any
from utils.geometry import overlap

def process_detections_to_classroom(
    detections: List[Dict[str, Any]],
    overlap_threshold: float = 0.15,
    default_landmarks: Dict[str, Any] = None
) -> Dict[str, Any]:
    """
    Takes detected objects, extracts chairs and persons, checks IoU overlap,
    and returns classroom seating layout.
    """
    chairs = [d for d in detections if d["label"] in ["chair", "couch", "bench"]]
    people = [d for d in detections if d["label"] == "person"]

    seats = []
    for idx, chair in enumerate(chairs, 1):
        c_box = chair["bbox"]
        c_center = chair["center"]
        
        # Check overlap with any detected person
        is_occupied = False
        for p in people:
            p_box = p["bbox"]
            iou = overlap(c_box, p_box)
            # Also check if person center lies within chair box
            p_cx, p_cy = p["center"]
            center_inside = (c_box[0] <= p_cx <= c_box[2]) and (c_box[1] <= p_cy <= c_box[3])
            if iou >= overlap_threshold or center_inside:
                is_occupied = True
                break

        seats.append({
            "id": idx,
            "x": c_center[0],
            "y": c_center[1],
            "bbox": c_box,
            "occupied": is_occupied,
            "confidence": chair["confidence"],
            "label": f"Seat #{idx}"
        })

    # Prepare landmarks
    classroom_data = {
        "seats": seats,
        "teacher": default_landmarks.get("teacher", {"x": 350, "y": 120}) if default_landmarks else {"x": 350, "y": 120},
        "board": default_landmarks.get("board", {"x": 350, "y": 50}) if default_landmarks else {"x": 350, "y": 50},
        "fan": default_landmarks.get("fan", {"x": 250, "y": 80}) if default_landmarks else {"x": 250, "y": 80},
        "exit": default_landmarks.get("exit", {"x": 60, "y": 400}) if default_landmarks else {"x": 60, "y": 400},
        "friends": default_landmarks.get("friends", []) if default_landmarks else []
    }

    return classroom_data

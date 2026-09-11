import math
from typing import Tuple, List, Dict, Any

def distance(p1: Dict[str, float], p2: Dict[str, float]) -> float:
    """Calculates Euclidean distance between two points."""
    return math.sqrt((p1["x"] - p2["x"]) ** 2 + (p1["y"] - p2["y"]) ** 2)

def normalize(value: float, min_val: float, max_val: float, invert: bool = False) -> float:
    """
    Normalizes a value between 0 and 100 based on min and max bounds.
    If invert is True, smaller original values get higher normalized scores.
    """
    if max_val == min_val:
        return 50.0
    val_clamped = max(min(value, max_val), min_val)
    ratio = (val_clamped - min_val) / (max_val - min_val)
    if invert:
        ratio = 1.0 - ratio
    return ratio * 100.0

def overlap(box1: List[float], box2: List[float]) -> float:
    """
    Calculates Intersection over Union (IoU) between two bounding boxes: [x1, y1, x2, y2].
    """
    xA = max(box1[0], box2[0])
    yA = max(box1[1], box2[1])
    xB = min(box1[2], box2[2])
    yB = min(box1[3], box2[3])

    inter_width = max(0.0, xB - xA)
    inter_height = max(0.0, yB - yA)
    inter_area = inter_width * inter_height

    box1_area = max(0.0, (box1[2] - box1[0]) * (box1[3] - box1[1]))
    box2_area = max(0.0, (box2[2] - box2[0]) * (box2[3] - box2[1]))
    union_area = box1_area + box2_area - inter_area

    if union_area <= 0:
        return 0.0
    return inter_area / union_area

def nearest_point(target: Dict[str, float], points: List[Dict[str, float]]) -> Tuple[Dict[str, float], float]:
    """Finds the closest point from a list to a target point."""
    if not points:
        return {}, float("inf")
    closest = min(points, key=lambda p: distance(target, p))
    return closest, distance(target, closest)

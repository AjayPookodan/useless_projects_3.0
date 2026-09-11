"""
Classroom visualization module for Best Seat Detector.
Draws seats, occupancy status, scores, landmarks, and highlights the best seat.
"""

from PIL import Image, ImageDraw, ImageFont
import numpy as np
from typing import Dict, Any, List

def draw_classroom_visualization(
    image: Image.Image,
    ranked_seats: List[Dict[str, Any]],
    best_seat: Dict[str, Any],
    worst_seat: Dict[str, Any] = None,
    landmarks: Dict[str, Any] = None
) -> Image.Image:
    """
    Renders seat markers and landmarks over the classroom image.
    GREEN  -> Best seat
    YELLOW -> Available seats
    RED    -> Occupied seats
    """
    img_copy = image.copy().convert("RGBA")
    overlay = Image.new("RGBA", img_copy.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    # Colors
    COLOR_BEST = (34, 197, 94, 230)      # Bright Green
    COLOR_AVAIL = (234, 179, 8, 200)     # Yellow
    COLOR_OCCUPIED = (239, 68, 68, 200)  # Red
    COLOR_WORST = (244, 63, 94, 230)     # Rose/Crimson
    COLOR_TEXT = (255, 255, 255, 255)
    COLOR_DARK = (15, 23, 42, 220)

    # Try loading default font
    try:
        font_lg = ImageFont.load_default()
        font_sm = ImageFont.load_default()
    except Exception:
        font_lg = None
        font_sm = None

    best_id = best_seat.get("seat_id") if best_seat else None
    worst_id = worst_seat.get("seat_id") if worst_seat else None

    # Draw Landmarks first if provided
    if landmarks:
        # Teacher
        if "teacher" in landmarks:
            tx, ty = landmarks["teacher"]["x"], landmarks["teacher"]["y"]
            draw.rectangle([tx - 40, ty - 15, tx + 40, ty + 15], fill=(59, 130, 246, 220), outline=(255, 255, 255, 255), width=2)
            draw.text((tx - 25, ty - 6), "TEACHER", fill=COLOR_TEXT)
        # Board
        if "board" in landmarks:
            bx, by = landmarks["board"]["x"], landmarks["board"]["y"]
            draw.rectangle([bx - 60, by - 12, bx + 60, by + 12], fill=(16, 185, 129, 220), outline=(255, 255, 255, 255), width=2)
            draw.text((bx - 20, ty if False else by - 6), "BOARD", fill=COLOR_TEXT)
        # Exit
        if "exit" in landmarks:
            ex, ey = landmarks["exit"]["x"], landmarks["exit"]["y"]
            draw.rectangle([ex - 25, ey - 15, ex + 25, ey + 15], fill=(234, 88, 12, 220), outline=(255, 255, 255, 255), width=2)
            draw.text((ex - 15, ey - 6), "EXIT", fill=COLOR_TEXT)
        # Fan
        if "fan" in landmarks:
            fx, fy = landmarks["fan"]["x"], landmarks["fan"]["y"]
            draw.ellipse([fx - 18, fy - 18, fx + 18, fy + 18], fill=(6, 182, 212, 220), outline=(255, 255, 255, 255), width=2)
            draw.text((fx - 10, fy - 6), "FAN", fill=COLOR_TEXT)

    # Draw Seats
    for seat in ranked_seats:
        s_id = seat.get("seat_id")
        x = seat.get("x", 0)
        y = seat.get("y", 0)
        occupied = seat.get("occupied", False)
        score = seat.get("final_score", 0.0)

        is_best = (s_id == best_id)
        is_worst = (s_id == worst_id and not occupied)

        radius = 26 if is_best else 20

        if is_best:
            fill_col = COLOR_BEST
            # Outer glowing ring for the best seat
            draw.ellipse([x - radius - 8, y - radius - 8, x + radius + 8, y + radius + 8], outline=(34, 197, 94, 255), width=4)
        elif is_worst:
            fill_col = COLOR_WORST
        elif occupied:
            fill_col = COLOR_OCCUPIED
        else:
            fill_col = COLOR_AVAIL

        # Draw circle
        draw.ellipse([x - radius, y - radius, x + radius, y + radius], fill=fill_col, outline=(255, 255, 255, 255), width=2)

        # Draw text: #ID and score
        label_top = f"#{s_id}"
        draw.text((x - 8, y - 10), label_top, fill=COLOR_TEXT)
        
        # Pill badge with score
        if not occupied:
            score_str = f"{score:.1f}"
            bx1, by1 = x - 20, y + radius + 2
            bx2, by2 = x + 20, y + radius + 16
            draw.rectangle([bx1, by1, bx2, by2], fill=COLOR_DARK, outline=(255, 255, 255, 200), width=1)
            draw.text((x - 14, by1 + 1), score_str, fill=(255, 255, 255, 255))
        else:
            bx1, by1 = x - 18, y + radius + 2
            bx2, by2 = x + 18, y + radius + 16
            draw.rectangle([bx1, by1, bx2, by2], fill=COLOR_DARK, outline=(255, 100, 100, 200), width=1)
            draw.text((x - 12, by1 + 1), "OCC", fill=(255, 150, 150, 255))

    combined = Image.alpha_composite(img_copy, overlay)
    return combined.convert("RGB")

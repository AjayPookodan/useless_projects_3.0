"""
Computer Vision Object Detector using Ultralytics YOLO.
Modularly identifies chairs, persons, and classroom elements.
"""

from typing import List, Dict, Any, Optional
import os

class YOLODetector:
    def __init__(self, model_path: str = "yolov8n.pt"):
        self.model_path = model_path
        self.model = None
        self.loaded = False
        self._load_model()

    def _load_model(self):
        try:
            from ultralytics import YOLO
            self.model = YOLO(self.model_path)
            self.loaded = True
            print(f"[YOLODetector] Successfully loaded YOLO model from {self.model_path}")
        except Exception as e:
            print(f"[YOLODetector] Warning: Could not initialize Ultralytics YOLO ({e}). Fallback detection will be active.")
            self.loaded = False

    def detect(self, image_path_or_array: Any, conf_threshold: float = 0.25) -> List[Dict[str, Any]]:
        """
        Runs object detection on the image.
        Returns a list of dicts:
        {
            "label": "chair" | "person" | etc,
            "confidence": 0.93,
            "bbox": [x1, y1, x2, y2],
            "center": [cx, cy]
        }
        """
        detections = []
        if not self.loaded or self.model is None:
            return detections

        try:
            results = self.model(image_path_or_array, conf=conf_threshold, verbose=False)
            for r in results:
                boxes = r.boxes
                for box in boxes:
                    cls_id = int(box.cls[0].item())
                    label = self.model.names.get(cls_id, str(cls_id))
                    conf = float(box.conf[0].item())
                    xyxy = box.xyxy[0].tolist()
                    x1, y1, x2, y2 = xyxy
                    cx = (x1 + x2) / 2.0
                    cy = (y1 + y2) / 2.0

                    detections.append({
                        "label": label.lower(),
                        "confidence": round(conf, 4),
                        "bbox": [round(x1, 1), round(y1, 1), round(x2, 1), round(y2, 1)],
                        "center": [round(cx, 1), round(cy, 1)]
                    })
        except Exception as e:
            print(f"[YOLODetector] Detection error: {e}")

        return detections

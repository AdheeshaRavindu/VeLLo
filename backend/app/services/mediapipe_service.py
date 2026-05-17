import base64
from dataclasses import dataclass
import os
from pathlib import Path

import cv2
import mediapipe as mp
from mediapipe.tasks.python.vision.hand_landmarker import HandLandmarker, HandLandmarkerOptions
from mediapipe.tasks.python.core.base_options import BaseOptions
import numpy as np


@dataclass
class HandDetectionResult:
    hand_detected: bool
    confidence: float
    landmarks: list[list[float]]
    handedness: str | None = None
    handedness_score: float = 0.0
    error: str | None = None


class MediaPipeService:
    def __init__(self) -> None:
        # Get the path to the hand landmarker model
        model_path = Path(__file__).parent.parent.parent / "models" / "hand_landmarker.task"
        
        if not model_path.exists():
            raise FileNotFoundError(f"Hand landmarker model not found at {model_path}")
        
        # Create the detector options
        base_options = BaseOptions(model_asset_path=str(model_path))
        options = HandLandmarkerOptions(
            base_options=base_options,
            num_hands=1,
            min_hand_detection_confidence=0.6,
            min_hand_presence_confidence=0.6,
            min_tracking_confidence=0.6,
        )
        
        # Create the detector
        self._detector = HandLandmarker.create_from_options(options)

    def _decode_image(self, image_base64: str) -> np.ndarray:
        payload = image_base64
        if "," in image_base64:
            payload = image_base64.split(",", maxsplit=1)[1]
        image_bytes = base64.b64decode(payload)
        np_arr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        if frame is None:
            raise ValueError("Invalid image payload")
        return frame

    def detect_hands(self, image_base64: str) -> HandDetectionResult:
        try:
            frame_bgr = self._decode_image(image_base64)
        except Exception:
            return HandDetectionResult(
                hand_detected=False,
                confidence=0.0,
                landmarks=[],
                error="Unable to decode frame",
            )

        # Convert BGR to RGB for MediaPipe
        frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
        
        # Create MediaPipe Image object
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=frame_rgb)
        
        # Detect hands
        try:
            results = self._detector.detect(mp_image)
        except Exception as e:
            return HandDetectionResult(
                hand_detected=False,
                confidence=0.0,
                landmarks=[],
                error=f"Detection error: {str(e)}",
            )
        
        # Check if hands were detected
        if not results.hand_landmarks:
            return HandDetectionResult(hand_detected=False, confidence=0.0, landmarks=[])

        # Extract landmarks from the first detected hand
        landmarks: list[list[float]] = []
        for point in results.hand_landmarks[0]:
            landmarks.append([float(point.x), float(point.y), float(point.z)])

        # Get confidence and handedness from results
        confidence = 0.9
        handedness = None
        handedness_score = 0.0
        
        if results.handedness and len(results.handedness) > 0:
            # Handedness contains classification results with score
            handedness_classification = results.handedness[0]
            handedness = handedness_classification.category_name  # "Left" or "Right"
            handedness_score = float(handedness_classification.score)
            confidence = handedness_score

        return HandDetectionResult(
            hand_detected=True, 
            confidence=confidence, 
            landmarks=landmarks,
            handedness=handedness,
            handedness_score=handedness_score
        )


# Lazy initialization - only create when first needed
_mediapipe_service = None


def get_mediapipe_service() -> "MediaPipeService":
    global _mediapipe_service
    if _mediapipe_service is None:
        _mediapipe_service = MediaPipeService()
    return _mediapipe_service


# For backwards compatibility, provide a property-like singleton
mediapipe_service = None


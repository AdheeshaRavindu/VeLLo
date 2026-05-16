import base64
from dataclasses import dataclass

import cv2
import mediapipe as mp
import numpy as np


@dataclass
class HandDetectionResult:
    hand_detected: bool
    confidence: float
    landmarks: list[list[float]]
    error: str | None = None


class MediaPipeService:
    def __init__(self) -> None:
        self._hands = mp.solutions.hands.Hands(
            static_image_mode=False,
            max_num_hands=1,
            model_complexity=0,
            min_detection_confidence=0.6,
            min_tracking_confidence=0.6,
        )

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

        frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
        results = self._hands.process(frame_rgb)
        if not results.multi_hand_landmarks:
            return HandDetectionResult(hand_detected=False, confidence=0.0, landmarks=[])

        landmarks: list[list[float]] = []
        for point in results.multi_hand_landmarks[0].landmark:
            landmarks.append([float(point.x), float(point.y), float(point.z)])

        return HandDetectionResult(hand_detected=True, confidence=0.9, landmarks=landmarks)


mediapipe_service = MediaPipeService()


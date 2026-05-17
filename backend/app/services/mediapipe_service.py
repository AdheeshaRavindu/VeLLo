import base64
import tempfile
from dataclasses import dataclass
from pathlib import Path

import cv2
import mediapipe as mp
import numpy as np
import requests

HAND_LANDMARKER_MODEL_URL = (
    "https://storage.googleapis.com/mediapipe-models/hand_landmarker/"
    "hand_landmarker/float16/1/hand_landmarker.task"
)


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
        self._hands = None
        self._task_hand_landmarker = None
        self._init_error: str | None = None

        if hasattr(mp, "solutions"):
            self._hands = mp.solutions.hands.Hands(
                static_image_mode=False,
                max_num_hands=1,
                model_complexity=0,
                min_detection_confidence=0.6,
                min_tracking_confidence=0.6,
            )
            return

        try:
            from mediapipe.tasks import python as mp_python
            from mediapipe.tasks.python import vision as mp_vision

            model_path = self._ensure_task_model()
            options = mp_vision.HandLandmarkerOptions(
                base_options=mp_python.BaseOptions(model_asset_path=str(model_path)),
                num_hands=1,
                min_hand_detection_confidence=0.6,
                min_hand_presence_confidence=0.6,
                min_tracking_confidence=0.6,
            )
            self._task_hand_landmarker = mp_vision.HandLandmarker.create_from_options(options)
        except Exception as exc:
            self._init_error = f"MediaPipe initialization failed: {exc}"

    def _ensure_task_model(self) -> Path:
        model_path = Path(tempfile.gettempdir()) / "hand_landmarker.task"
        if model_path.exists():
            return model_path
        response = requests.get(HAND_LANDMARKER_MODEL_URL, timeout=30)
        response.raise_for_status()
        model_path.write_bytes(response.content)
        return model_path

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
        if self._hands is None and self._task_hand_landmarker is None:
            return HandDetectionResult(
                hand_detected=False,
                confidence=0.0,
                landmarks=[],
                handedness=None,
                handedness_score=0.0,
                error=self._init_error or "MediaPipe hand detector unavailable",
            )

        try:
            frame_bgr = self._decode_image(image_base64)
        except Exception:
            return HandDetectionResult(
                hand_detected=False,
                confidence=0.0,
                landmarks=[],
                handedness=None,
                handedness_score=0.0,
                error="Unable to decode frame",
            )

        frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
        if self._hands is not None:
            results = self._hands.process(frame_rgb)
            if not results.multi_hand_landmarks:
                return HandDetectionResult(
                    hand_detected=False,
                    confidence=0.0,
                    landmarks=[],
                    handedness=None,
                    handedness_score=0.0,
                )

            landmarks: list[list[float]] = []
            for point in results.multi_hand_landmarks[0].landmark:
                landmarks.append([float(point.x), float(point.y), float(point.z)])

            handedness = None
            handedness_score = 0.0
            if results.multi_handedness and results.multi_handedness[0].classification:
                primary = results.multi_handedness[0].classification[0]
                handedness = primary.label
                handedness_score = float(primary.score)

            return HandDetectionResult(
                hand_detected=True,
                confidence=0.9,
                landmarks=landmarks,
                handedness=handedness,
                handedness_score=handedness_score,
            )

        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=frame_rgb)
        task_result = self._task_hand_landmarker.detect(mp_image)
        if not task_result.hand_landmarks:
            return HandDetectionResult(
                hand_detected=False,
                confidence=0.0,
                landmarks=[],
                handedness=None,
                handedness_score=0.0,
            )

        task_landmarks = task_result.hand_landmarks[0]
        landmarks = [[float(point.x), float(point.y), float(point.z)] for point in task_landmarks]

        handedness = None
        handedness_score = 0.0
        if task_result.handedness and task_result.handedness[0]:
            category = task_result.handedness[0][0]
            handedness = getattr(category, "category_name", None)
            handedness_score = float(getattr(category, "score", 0.0))

        return HandDetectionResult(
            hand_detected=True,
            confidence=0.9,
            landmarks=landmarks,
            handedness=handedness,
            handedness_score=handedness_score,
        )


mediapipe_service = MediaPipeService()


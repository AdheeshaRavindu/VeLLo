import base64
from dataclasses import dataclass
from pathlib import Path
import urllib.request

import cv2
import mediapipe as mp
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
    _TASK_MODEL_URL = (
        "https://storage.googleapis.com/mediapipe-models/hand_landmarker/"
        "hand_landmarker/float16/1/hand_landmarker.task"
    )

    def __init__(self) -> None:
        self._backend: str = ""
        self._hands = None
        self._landmarker = None
        self._init_error: str | None = None

        try:
            if hasattr(mp, "solutions"):
                self._hands = mp.solutions.hands.Hands(
                    static_image_mode=True,
                    max_num_hands=2,
                    model_complexity=0,
                    min_detection_confidence=0.25,
                    min_tracking_confidence=0.25,
                )
                self._backend = "solutions"
                return
        except Exception as exc:
            self._init_error = f"MediaPipe solutions init failed: {exc}"

        try:
            self._landmarker = self._create_tasks_landmarker()
            self._backend = "tasks"
        except Exception as exc:
            self._backend = "unavailable"
            self._init_error = f"MediaPipe tasks init failed: {exc}"

    def _ensure_task_model(self) -> str:
        model_path = Path(__file__).resolve().parents[2] / "models" / "hand_landmarker.task"
        model_path.parent.mkdir(parents=True, exist_ok=True)
        if not model_path.exists():
            urllib.request.urlretrieve(self._TASK_MODEL_URL, model_path)
        return str(model_path)

    def _create_tasks_landmarker(self):
        from mediapipe.tasks.python import BaseOptions
        from mediapipe.tasks.python import vision

        options = vision.HandLandmarkerOptions(
            base_options=BaseOptions(model_asset_path=self._ensure_task_model()),
            num_hands=2,
            min_hand_detection_confidence=0.25,
            min_hand_presence_confidence=0.25,
            min_tracking_confidence=0.25,
        )
        return vision.HandLandmarker.create_from_options(options)

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
                handedness=None,
                handedness_score=0.0,
                error="Unable to decode frame",
            )

        try:
            frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)

            if self._backend == "solutions" and self._hands is not None:
                results = self._hands.process(frame_rgb)
                if not results.multi_hand_landmarks:
                    return HandDetectionResult(
                        hand_detected=False,
                        confidence=0.0,
                        landmarks=[],
                        handedness=None,
                        handedness_score=0.0,
                    )

                primary_points = results.multi_hand_landmarks[0].landmark
                landmarks: list[list[float]] = [
                    [float(point.x), float(point.y), float(point.z)]
                    for point in primary_points
                ]

                handedness_label: str | None = None
                handedness_score = 0.0
                if results.multi_handedness:
                    classification = results.multi_handedness[0].classification[0]
                    handedness_label = str(classification.label)
                    handedness_score = float(classification.score)

                return HandDetectionResult(
                    hand_detected=True,
                    confidence=max(0.7, handedness_score),
                    landmarks=landmarks,
                    handedness=handedness_label,
                    handedness_score=handedness_score,
                )

            if self._landmarker is None:
                return HandDetectionResult(
                    hand_detected=False,
                    confidence=0.0,
                    landmarks=[],
                    handedness=None,
                    handedness_score=0.0,
                    error=self._init_error or "MediaPipe backend unavailable",
                )

            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=frame_rgb)
            task_results = self._landmarker.detect(mp_image)
            if not task_results.hand_landmarks:
                return HandDetectionResult(
                    hand_detected=False,
                    confidence=0.0,
                    landmarks=[],
                    handedness=None,
                    handedness_score=0.0,
                )

            primary_points = task_results.hand_landmarks[0]
            landmarks = [
                [float(point.x), float(point.y), float(point.z)]
                for point in primary_points
            ]

            handedness_label: str | None = None
            handedness_score = 0.0
            if task_results.handedness and task_results.handedness[0]:
                category = task_results.handedness[0][0]
                handedness_label = str(category.category_name)
                handedness_score = float(category.score)

            return HandDetectionResult(
                hand_detected=True,
                confidence=max(0.7, handedness_score),
                landmarks=landmarks,
                handedness=handedness_label,
                handedness_score=handedness_score,
            )
        except Exception:
            return HandDetectionResult(
                hand_detected=False,
                confidence=0.0,
                landmarks=[],
                handedness=None,
                handedness_score=0.0,
                error="Hand detection failed",
            )


mediapipe_service = MediaPipeService()


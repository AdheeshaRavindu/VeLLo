from pathlib import Path
from typing import Optional

import joblib
import numpy as np

from app.services.gesture_service import GestureResult
from app.utils.config import get_env


DEFAULT_HELP_MODEL = Path(__file__).resolve().parents[2] / "models" / "help_detector.pkl"
_MODEL_CACHE: dict = {"path": None, "mtime": None, "clf": None}


def _resolve_model_path() -> Path:
    path = get_env("HELP_MODEL_FILE", str(DEFAULT_HELP_MODEL))
    return Path(path)


def _load_model():
    path = _resolve_model_path()
    if not path.exists():
        _MODEL_CACHE.update({"path": str(path), "mtime": None, "clf": None})
        return None
    mtime = path.stat().st_mtime
    if _MODEL_CACHE.get("path") == str(path) and _MODEL_CACHE.get("mtime") == mtime:
        return _MODEL_CACHE.get("clf")
    try:
        data = joblib.load(path)
        clf = data.get("clf") if isinstance(data, dict) and "clf" in data else data
        _MODEL_CACHE.update({"path": str(path), "mtime": mtime, "clf": clf})
        return clf
    except Exception:
        return None


def _build_feature_vector(landmarks: list[list[float]] | None, secondary_landmarks: list[list[float]] | None) -> Optional[np.ndarray]:
    # Flatten primary 21x3 then secondary 21x3 (zeros if missing)
    vec = []
    def add(hand):
        if hand is None or len(hand) < 21:
            vec.extend([0.0] * 63)
            return
        for lm in hand[:21]:
            vec.extend([float(lm[0]), float(lm[1]), float(lm[2])])

    add(landmarks)
    add(secondary_landmarks)
    return np.array(vec, dtype=np.float32).reshape(1, -1)


def classify_help_model(landmarks: list[list[float]] | None, secondary_landmarks: list[list[float]] | None = None) -> GestureResult:
    clf = _load_model()
    if clf is None:
        return GestureResult(intent=None, confidence=0.0)

    X = _build_feature_vector(landmarks, secondary_landmarks)
    if X is None:
        return GestureResult(intent=None, confidence=0.0)

    try:
        probs = clf.predict_proba(X)[0]
        # assume binary classifier [not_help, help] or use positive class index 1
        if probs.shape[0] == 1:
            confidence = float(probs[0])
        else:
            confidence = float(probs[1])
        intent = "help" if confidence >= 0.0 else None
        return GestureResult(intent=intent, confidence=max(0.0, min(1.0, confidence)))
    except Exception:
        # fallback: try predict
        pred = clf.predict(X)[0]
        intent = "help" if int(pred) == 1 else None
        confidence = 0.9 if intent == "help" else 0.0
        return GestureResult(intent=intent, confidence=confidence)

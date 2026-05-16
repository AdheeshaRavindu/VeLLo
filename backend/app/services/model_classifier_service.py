import json
from pathlib import Path

import numpy as np

from app.services.gesture_service import GestureResult
from app.utils.config import get_env
from app.utils.constants import SUPPORTED_INTENTS

# Future model outputs must map into this ordered label vocabulary.
# Expand this list by updating SUPPORTED_INTENTS first, then retraining.
MODEL_LABELS: list[str] = list(SUPPORTED_INTENTS)
DEFAULT_MODEL_PATH = Path(__file__).resolve().parents[1] / "data" / "models" / "gesture_centroid_model.json"

_MODEL_CACHE: dict[str, object] = {
    "path": None,
    "mtime": None,
    "labels": None,
    "centroids": None,
    "temperature": 0.35,
}


def model_index_to_intent(index: int) -> str | None:
    if index < 0 or index >= len(MODEL_LABELS):
        return None
    return MODEL_LABELS[index]


def _build_feature_vector(landmarks: list[list[float]]) -> np.ndarray | None:
    if len(landmarks) < 21:
        return None
    matrix = np.array(landmarks[:21], dtype=np.float32)
    if matrix.shape != (21, 3):
        return None

    wrist = matrix[0]
    centered = matrix - wrist
    palm_size = float(np.linalg.norm(matrix[9] - matrix[0]))
    scale = palm_size if palm_size > 1e-4 else 1.0
    normalized = centered / scale
    return normalized.reshape(-1)


def _resolve_model_path() -> Path:
    model_path = get_env("MODEL_FILE", str(DEFAULT_MODEL_PATH))
    return Path(model_path)


def _load_model() -> tuple[list[str], np.ndarray, float] | None:
    path = _resolve_model_path()
    cache_path = _MODEL_CACHE.get("path")
    cache_mtime = _MODEL_CACHE.get("mtime")

    if not path.exists():
        _MODEL_CACHE["path"] = str(path)
        _MODEL_CACHE["mtime"] = None
        _MODEL_CACHE["labels"] = None
        _MODEL_CACHE["centroids"] = None
        return None

    mtime = path.stat().st_mtime
    if cache_path == str(path) and cache_mtime == mtime:
        labels = _MODEL_CACHE.get("labels")
        centroids = _MODEL_CACHE.get("centroids")
        temperature = float(_MODEL_CACHE.get("temperature", 0.35))
        if isinstance(labels, list) and isinstance(centroids, np.ndarray):
            return labels, centroids, temperature

    data = json.loads(path.read_text(encoding="utf-8"))
    labels = data.get("labels", [])
    centroids_data = data.get("centroids", [])
    temperature = float(data.get("temperature", 0.35))
    centroids = np.array(centroids_data, dtype=np.float32)

    if not isinstance(labels, list) or centroids.ndim != 2 or centroids.shape[0] != len(labels):
        return None

    _MODEL_CACHE["path"] = str(path)
    _MODEL_CACHE["mtime"] = mtime
    _MODEL_CACHE["labels"] = labels
    _MODEL_CACHE["centroids"] = centroids
    _MODEL_CACHE["temperature"] = temperature
    return labels, centroids, temperature


def classify_with_model(
    landmarks: list[list[float]],
    handedness: str | None = None,
) -> GestureResult:
    _ = handedness
    model = _load_model()
    if model is None:
        return GestureResult(intent=None, confidence=0.0)

    labels, centroids, temperature = model
    features = _build_feature_vector(landmarks)
    if features is None:
        return GestureResult(intent=None, confidence=0.0)

    deltas = centroids - features
    distances = np.linalg.norm(deltas, axis=1)
    best_idx = int(np.argmin(distances))
    logits = -distances / max(temperature, 1e-3)
    logits = logits - np.max(logits)
    exp_logits = np.exp(logits)
    probabilities = exp_logits / max(float(np.sum(exp_logits)), 1e-6)
    confidence = float(probabilities[best_idx])
    intent = labels[best_idx]

    if intent not in SUPPORTED_INTENTS:
        return GestureResult(intent=None, confidence=0.0)

    return GestureResult(intent=intent, confidence=max(0.0, min(1.0, confidence)))

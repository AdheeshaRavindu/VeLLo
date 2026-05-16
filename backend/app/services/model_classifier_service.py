from app.services.gesture_service import GestureResult
from app.utils.constants import SUPPORTED_INTENTS

# Future model outputs must map into this ordered label vocabulary.
# Expand this list by updating SUPPORTED_INTENTS first, then retraining.
MODEL_LABELS: list[str] = list(SUPPORTED_INTENTS)


def model_index_to_intent(index: int) -> str | None:
    if index < 0 or index >= len(MODEL_LABELS):
        return None
    return MODEL_LABELS[index]


def classify_with_model(
    landmarks: list[list[float]],
    handedness: str | None = None,
) -> GestureResult:
    # Placeholder for a trained classifier path. Returning None keeps
    # rule-based behavior as the active fallback until a model is added.
    _ = (landmarks, handedness)
    return GestureResult(intent=None, confidence=0.0)

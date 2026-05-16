from app.services.gesture_service import GestureResult


def classify_with_model(
    landmarks: list[list[float]],
    handedness: str | None = None,
) -> GestureResult:
    # Placeholder for a trained classifier path. Returning None keeps
    # rule-based behavior as the active fallback until a model is added.
    _ = (landmarks, handedness)
    return GestureResult(intent=None, confidence=0.0)

from app.services.gesture_service import GestureResult, classify_gesture
from app.services.model_classifier_service import classify_with_model
from app.utils.config import get_env
from app.utils.constants import SUPPORTED_INTENTS


def classify_intent(
    landmarks: list[list[float]],
    handedness: str | None,
    detector_confidence: float,
) -> GestureResult:
    mode = get_env("CLASSIFIER_MODE", "rule").lower()

    if mode == "model":
        model_result = classify_with_model(landmarks, handedness)
        if model_result.intent is not None and model_result.intent in SUPPORTED_INTENTS:
            return model_result

    return classify_gesture(landmarks, handedness, detector_confidence)

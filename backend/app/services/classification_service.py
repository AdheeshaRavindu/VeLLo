from app.services.gesture_service import GestureResult, classify_gesture
from app.services.model_classifier_service import classify_with_model
from app.services.help_model_service import classify_help_model
from app.utils.config import get_env
from app.utils.constants import SUPPORTED_INTENTS


def classify_intent(
    landmarks: list[list[float]],
    handedness: str | None,
    detector_confidence: float,
    secondary_landmarks: list[list[float]] | None = None,
    secondary_handedness: str | None = None,
) -> GestureResult:
    mode = get_env("CLASSIFIER_MODE", "rule").lower()

    # If configured, prefer the general centroid model first.
    if mode == "model":
        model_result = classify_with_model(landmarks, handedness)
        if model_result.intent is not None and model_result.intent in SUPPORTED_INTENTS:
            return model_result

    # Fall back to rule-based classifier.
    rule_result = classify_gesture(
        landmarks,
        handedness,
        detector_confidence,
        secondary_landmarks=secondary_landmarks,
        secondary_handedness=secondary_handedness,
    )

    # If rule-based returned low confidence or no decision, consult the specialized help model.
    if (rule_result.intent is None or rule_result.confidence < 0.7):
        help_result = classify_help_model(landmarks, secondary_landmarks)
        if help_result.intent == "help" and help_result.confidence >= 0.6:
            return help_result

    return rule_result

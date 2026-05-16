from fastapi import APIRouter

from app.models.request_models import DetectRequest
from app.models.response_models import DetectionResponse
from app.services.classification_service import classify_intent
from app.services.mediapipe_service import mediapipe_service
from app.services.phrase_mapper import map_intent_to_phrase
from app.services.training_data_service import append_training_sample
from app.utils.constants import INTENT_THRESHOLDS, SUPPORTED_INTENTS

router = APIRouter(prefix="/api", tags=["detect"])


@router.post("/detect", response_model=DetectionResponse)
def detect_sign(payload: DetectRequest) -> DetectionResponse:
    if payload.demo_intent in SUPPORTED_INTENTS:
        phrase = map_intent_to_phrase(payload.demo_intent)
        return DetectionResponse(
            hand_detected=True,
            confidence=0.99,
            intent=payload.demo_intent,
            phrase=phrase,
            source="demo",
            handedness=None,
            handedness_score=0.0,
            detector_confidence=0.99,
            debug_landmarks=None,
            capture_saved=False,
            error=None,
        )

    result = mediapipe_service.detect_hands(payload.image_base64)
    intent: str | None = None
    confidence = result.confidence
    phrase: str | None = None
    capture_saved = False

    if result.hand_detected:
        gesture_result = classify_intent(
            landmarks=result.landmarks,
            handedness=result.handedness,
            detector_confidence=result.confidence,
        )
        intent = gesture_result.intent
        confidence = gesture_result.confidence
        if intent and intent in SUPPORTED_INTENTS:
            threshold = INTENT_THRESHOLDS.get(intent, 0.7)
            if confidence >= threshold:
                phrase = map_intent_to_phrase(intent)
            else:
                intent = None
        else:
            intent = None

        if payload.capture_sample and payload.capture_label in SUPPORTED_INTENTS:
            append_training_sample(
                label=payload.capture_label,
                landmarks=result.landmarks,
                handedness=result.handedness,
                handedness_score=result.handedness_score,
                predicted_intent=intent,
                predicted_confidence=confidence,
            )
            capture_saved = True

    return DetectionResponse(
        hand_detected=result.hand_detected,
        confidence=confidence,
        intent=intent,
        phrase=phrase,
        source="vision",
        handedness=result.handedness,
        handedness_score=result.handedness_score,
        detector_confidence=result.confidence,
        debug_landmarks=result.landmarks if payload.include_debug else None,
        capture_saved=capture_saved,
        error=result.error,
    )


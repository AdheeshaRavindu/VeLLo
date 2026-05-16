from fastapi import APIRouter

from app.models.request_models import DetectRequest
from app.models.response_models import DetectionResponse
from app.services.gesture_service import classify_gesture
from app.services.mediapipe_service import mediapipe_service
from app.services.phrase_mapper import map_intent_to_phrase
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
            error=None,
        )

    result = mediapipe_service.detect_hands(payload.image_base64)
    intent: str | None = None
    confidence = result.confidence
    phrase: str | None = None

    if result.hand_detected:
        gesture_result = classify_gesture(result.landmarks)
        intent = gesture_result.intent
        confidence = gesture_result.confidence
        if intent:
            threshold = INTENT_THRESHOLDS.get(intent, 0.7)
            if confidence >= threshold:
                phrase = map_intent_to_phrase(intent)
            else:
                intent = None

    return DetectionResponse(
        hand_detected=result.hand_detected,
        confidence=confidence,
        intent=intent,
        phrase=phrase,
        source="vision",
        error=result.error,
    )


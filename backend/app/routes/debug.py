from fastapi import APIRouter

from app.models.request_models import DetectRequest
from app.models.response_models import DetectionResponse
from app.services.classification_service import classify_intent
from app.services.mediapipe_service import mediapipe_service
from app.services.phrase_mapper import map_intent_to_phrase
from app.utils.constants import SUPPORTED_INTENTS

router = APIRouter(prefix="/api", tags=["debug"])


@router.post("/debug", response_model=DetectionResponse)
def debug_detect(payload: DetectRequest) -> DetectionResponse:
    """Like /detect but always returns debug fields to help troubleshooting."""
    result = mediapipe_service.detect_hands(payload.image_base64)
    intent = None
    confidence = result.confidence
    phrase = None
    raw_intent = None
    raw_confidence = None
    asl_yes_debug = None

    if result.hand_detected:
        gesture_result = classify_intent(
            landmarks=result.landmarks,
            handedness=result.handedness,
            detector_confidence=result.confidence,
            secondary_landmarks=result.secondary_landmarks,
            secondary_handedness=result.secondary_handedness,
        )
        raw_intent = gesture_result.intent
        raw_confidence = gesture_result.confidence
        asl_yes_debug = gesture_result.debug
        intent = raw_intent
        confidence = raw_confidence
        if intent and intent in SUPPORTED_INTENTS:
            phrase = map_intent_to_phrase(intent)

    return DetectionResponse(
        hand_detected=result.hand_detected,
        confidence=confidence,
        intent=intent,
        canonical_asl=None,
        phrase=phrase,
        source="debug",
        handedness=result.handedness,
        handedness_score=result.handedness_score,
        detector_confidence=result.confidence,
        debug_landmarks=result.landmarks,
        raw_intent=raw_intent,
        raw_confidence=raw_confidence,
        accepted_intent=intent,
        acceptance_threshold=0.0,
        accepted_phrase_available=phrase is not None,
        suppression_reason=None,
        asl_yes_debug=asl_yes_debug,
        capture_saved=False,
        error=result.error,
    )

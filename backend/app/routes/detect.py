from fastapi import APIRouter

from app.models.request_models import DetectRequest
from app.models.response_models import DetectionResponse
from app.services.classification_service import classify_intent
from app.services.mediapipe_service import mediapipe_service
from app.services.phrase_mapper import map_intent_to_phrase
from app.services.training_data_service import append_training_sample
from app.utils.constants import INTENT_THRESHOLDS, SUPPORTED_INTENTS

router = APIRouter(prefix="/api", tags=["detect"])
INTENT_ALIASES: dict[str, str] = {
    "help": "i_need_help",
    "emergency": "i_need_help",
}

# Load gesture aliases once and build intent -> canonical ASL mapping.
from pathlib import Path
import json

_ALIASES_PATH = Path(__file__).resolve().parents[3] / "shared" / "gesture_aliases.json"
_INTENT_TO_CANONICAL: dict[str, str] = {}
try:
    with open(_ALIASES_PATH, "r", encoding="utf-8") as f:
        _aliases = json.load(f)
        for _, v in _aliases.items():
            repo_intent = v.get("repo_intent")
            canonical = v.get("canonical_asl")
            if repo_intent and canonical:
                _INTENT_TO_CANONICAL[repo_intent] = canonical
except Exception:
    # If loading fails, leave mapping empty; API will return null for canonical_asl.
    _INTENT_TO_CANONICAL = {}


def _normalize_intent(intent: str | None) -> str | None:
    if intent is None:
        return None
    return INTENT_ALIASES.get(intent, intent)


@router.post("/detect", response_model=DetectionResponse)
def detect_sign(payload: DetectRequest) -> DetectionResponse:
    raw_intent: str | None = None
    raw_confidence: float | None = None
    accepted_intent: str | None = None
    acceptance_threshold: float | None = None
    accepted_phrase_available: bool | None = None
    suppression_reason: str | None = None
    asl_yes_debug: dict[str, float | int | bool] | None = None

    if payload.demo_intent in SUPPORTED_INTENTS:
        phrase = map_intent_to_phrase(payload.demo_intent)
        raw_intent = payload.demo_intent
        raw_confidence = 0.99
        accepted_intent = payload.demo_intent
        acceptance_threshold = INTENT_THRESHOLDS.get(payload.demo_intent, 0.7)
        accepted_phrase_available = phrase is not None
        canonical = _INTENT_TO_CANONICAL.get(payload.demo_intent)
        return DetectionResponse(
            hand_detected=True,
            confidence=0.99,
            intent=payload.demo_intent,
            canonical_asl=canonical,
            phrase=phrase,
            source="demo",
            handedness=None,
            handedness_score=0.0,
            detector_confidence=0.99,
            debug_landmarks=None,
            raw_intent=raw_intent if payload.include_debug else None,
            raw_confidence=raw_confidence if payload.include_debug else None,
            accepted_intent=accepted_intent if payload.include_debug else None,
            acceptance_threshold=acceptance_threshold if payload.include_debug else None,
            accepted_phrase_available=accepted_phrase_available if payload.include_debug else None,
            suppression_reason=None,
            asl_yes_debug=asl_yes_debug if payload.include_debug else None,
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
            secondary_landmarks=result.secondary_landmarks,
            secondary_handedness=result.secondary_handedness,
        )
        raw_intent = gesture_result.intent
        raw_confidence = gesture_result.confidence
        asl_yes_debug = gesture_result.debug
        intent = _normalize_intent(raw_intent)
        confidence = raw_confidence

        if intent and intent in SUPPORTED_INTENTS:
            threshold = INTENT_THRESHOLDS.get(intent, 0.7)
            acceptance_threshold = threshold
            if confidence >= threshold:
                phrase = map_intent_to_phrase(intent)
                if phrase is None:
                    suppression_reason = "phrase_not_mapped"
            else:
                suppression_reason = "confidence_below_backend_threshold"
                intent = "unknown"
        else:
            suppression_reason = (
                "classifier_returned_none" if intent is None else "intent_not_supported"
            )
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
    elif result.error is not None:
        suppression_reason = "vision_error"
    else:
        suppression_reason = "no_hand_detected"

    accepted_intent = intent
    accepted_phrase_available = phrase is not None
    canonical = None
    if accepted_intent is not None and accepted_intent != "unknown":
        canonical = _INTENT_TO_CANONICAL.get(accepted_intent)

    return DetectionResponse(
        hand_detected=result.hand_detected,
        confidence=confidence,
        intent=intent,
        canonical_asl=canonical,
        phrase=phrase,
        source="vision",
        handedness=result.handedness,
        handedness_score=result.handedness_score,
        detector_confidence=result.confidence,
        debug_landmarks=result.landmarks if payload.include_debug else None,
        raw_intent=raw_intent if payload.include_debug else None,
        raw_confidence=raw_confidence if payload.include_debug else None,
        accepted_intent=accepted_intent if payload.include_debug else None,
        acceptance_threshold=acceptance_threshold if payload.include_debug else None,
        accepted_phrase_available=accepted_phrase_available if payload.include_debug else None,
        suppression_reason=suppression_reason if payload.include_debug else None,
        asl_yes_debug=asl_yes_debug if payload.include_debug else None,
        capture_saved=capture_saved,
        error=result.error,
    )


from pydantic import BaseModel


class DetectionResponse(BaseModel):
    hand_detected: bool
    confidence: float
    intent: str | None
    phrase: str | None
    source: str
    handedness: str | None = None
    handedness_score: float | None = None
    detector_confidence: float | None = None
    debug_landmarks: list[list[float]] | None = None
    capture_saved: bool = False
    error: str | None = None


class VoiceResponse(BaseModel):
    ok: bool
    audio_base64: str | None
    content_type: str
    provider: str
    message: str


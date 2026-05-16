from pydantic import BaseModel


class DetectionResponse(BaseModel):
    hand_detected: bool
    confidence: float
    intent: str | None
    phrase: str | None
    source: str
    error: str | None = None


class VoiceResponse(BaseModel):
    ok: bool
    audio_base64: str | None
    content_type: str
    provider: str
    message: str


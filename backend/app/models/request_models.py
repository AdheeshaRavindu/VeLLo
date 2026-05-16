from pydantic import BaseModel, Field


class DetectRequest(BaseModel):
    image_base64: str | None = Field(default=None, min_length=16)
    landmarks: list[list[float]] | None = None
    handedness: str | None = None
    handedness_score: float = 0.0
    demo_intent: str | None = None
    include_debug: bool = False
    capture_sample: bool = False
    capture_label: str | None = None


class VoiceRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=200)


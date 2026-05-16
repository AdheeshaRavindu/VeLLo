from pydantic import BaseModel, Field


class DetectRequest(BaseModel):
    image_base64: str = Field(..., min_length=16)
    demo_intent: str | None = None
    include_debug: bool = False
    capture_sample: bool = False
    capture_label: str | None = None


class VoiceRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=200)


# Detect API Flow

## Endpoint
- `POST /api/detect`

## Request
```json
{
  "image_base64": "data:image/jpeg;base64,...",
  "demo_intent": "yes",
  "include_debug": false,
  "capture_sample": false,
  "capture_label": "yes"
}
```

## Response
```json
{
  "hand_detected": true,
  "confidence": 0.78,
  "intent": "yes",
  "phrase": "Yes.",
  "source": "vision",
  "handedness": "Right",
  "handedness_score": 0.97,
  "detector_confidence": 0.97,
  "debug_landmarks": null,
  "capture_saved": false,
  "error": null
}
```

## Notes
- `demo_intent` bypasses CV and returns deterministic demo output.
- `include_debug=true` adds raw landmarks to response in `debug_landmarks`.
- `capture_sample=true` with a valid `capture_label` writes a JSONL row to `backend/app/data/gesture_samples.jsonl`.
- `confidence` is classifier confidence after rule/model classification.
- `detector_confidence` is MediaPipe-side detector confidence.


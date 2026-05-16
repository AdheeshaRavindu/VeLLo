# Detection Architecture (Current)

## Pipeline
1. Frontend captures webcam frames and sends JPEG base64 payloads.
2. Backend extracts hand landmarks using MediaPipe Hands.
3. Intent classifier chooses route:
   - `CLASSIFIER_MODE=rule` -> rule-based classifier (active default)
   - `CLASSIFIER_MODE=model` -> model classifier, then fallback to rules
4. Intent is thresholded and mapped to hospital phrase.
5. Phrase is returned to frontend and spoken through voice flow.

## Rule Classifier Improvements
- Handedness-aware thumb extension checks.
- Palm-size normalization for scale-invariant distances.
- Priority-based rule ordering to reduce overlap collisions.

## Training Data Capture
- Optional request fields on `/api/detect`:
  - `include_debug`: include raw landmark array in response
  - `capture_sample`: boolean
  - `capture_label`: one of active intents
- When enabled, backend appends labeled samples to:
  - `backend/app/data/gesture_samples.jsonl`
- Stored sample fields:
  - timestamp, label, handedness, handedness score
  - predicted intent/confidence
  - raw landmarks


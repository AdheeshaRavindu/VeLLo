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

## Active Label Workflow
- Current active label set is defined in `backend/app/utils/constants.py` via `SUPPORTED_INTENTS`.
- During stabilization, the app runs in single-sign mode with only `yes`.
- Model label mapping contract is in `backend/app/services/model_classifier_service.py` (`MODEL_LABELS` and `model_index_to_intent`).

## Add-Next-Sign Checklist
1. Add the new intent string to `SUPPORTED_INTENTS`.
2. Add or tune threshold in `INTENT_THRESHOLDS`.
3. Add phrase entry in `shared/hospital_phrases.json`.
4. Update frontend `Intent` union and demo list.
5. Retrain/update model label mapping to match the new ordered label set.
6. Validate `/api/detect` live detection and `capture_label` writes.


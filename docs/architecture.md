# Detection Architecture (Current)

## Live Entry Points
- Primary demo: [https://vello.adheesha.dev/](https://vello.adheesha.dev/)
- Static gatekeeper page: [https://vello-static.pages.dev/gatekeeper](https://vello-static.pages.dev/gatekeeper)

## Pipeline
1. Frontend opens a camera/mic gatekeeper, then sends webcam frames as JPEG base64 payloads.
2. Backend extracts primary and secondary hand landmarks using MediaPipe Hands.
3. Intent classifier chooses a route:
   - `CLASSIFIER_MODE=rule` -> rule-based classifier (active default)
   - `CLASSIFIER_MODE=model` -> model classifier, then fallback to rules
4. Intent is normalized, thresholded, and mapped to a hospital phrase.
5. Response returns detection status, confidence, canonical ASL label, and phrase.
6. Frontend stabilizes repeated predictions before updating the UI and playing voice output.

## Rule Classifier Improvements
- Handedness-aware thumb extension checks.
- Palm-size normalization for scale-invariant distances.
- Priority-based rule ordering to reduce overlap collisions.
- Two-hand layout checks for `help`, `pain`, and `stop`.
- Short motion history for ASL-style `yes`.

## Active Sign Set
- `yes`: closed fist with optional nodding motion.
- `no`: index and middle fingers extended.
- `pain`: two index fingers extended near each other.
- `water`: W-like hand with index, middle, and ring fingers extended.
- `help`: thumb-up or loose fist supported by the other palm.
- `stop`: open-palm stop/chop pose.

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
- Model label mapping contract is in `backend/app/services/model_classifier_service.py` (`MODEL_LABELS` and `model_index_to_intent`).

## Add-Next-Sign Checklist
1. Add the new intent string to `SUPPORTED_INTENTS`.
2. Add or tune threshold in `INTENT_THRESHOLDS`.
3. Add phrase entry in `shared/hospital_phrases.json`.
4. Update frontend `Intent` union and demo list.
5. Retrain/update model label mapping to match the new ordered label set.
6. Validate `/api/detect` live detection and `capture_label` writes.


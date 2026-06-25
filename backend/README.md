# Backend (FastAPI)

Backend service for the Hospital Sign-to-Voice Assistant. It receives webcam frames, runs MediaPipe hand detection, classifies a constrained sign set, maps the intent to a phrase, and optionally generates voice.

## Run
- Create venv and install dependencies from `requirements.txt`.
- Start API:
  - `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`

## Run with Docker
From project root:

- `docker compose up --build`
- Backend image includes Linux runtime libs required by OpenCV/MediaPipe (`libgl1`, `libglib2.0-0`).

Backend will be available at:

- `http://localhost:8000`
- `http://localhost:8000/health`

## Endpoints
- `GET /health`
- `POST /api/detect`
- `POST /api/voice`

## Active Intents
- `yes`: "Yes."
- `no`: "No."
- `pain`: "I am in pain."
- `water`: "I need water."
- `help`: "Please help me."
- `stop`: "Please stop."

## Detection Tuning
- Default classifier mode is rule-based.
- Optional environment variable:
  - `CLASSIFIER_MODE=rule` (default)
  - `CLASSIFIER_MODE=model` (uses trained model path, then falls back to rules)
- Optional model file path:
  - `MODEL_FILE=app/data/models/gesture_centroid_model.json`
- Rule-based recognition checks hand shape, finger extension, relative hand positions, and limited motion history for `yes`.
- The backend threshold for each active intent is configured in `app/utils/constants.py`.

## Training Data Capture
`POST /api/detect` accepts optional fields:
- `capture_sample` (boolean)
- `capture_label` (active intent)

If enabled, labeled samples are appended to:
- `backend/app/data/gesture_samples.jsonl`

## Train a Model (Kaggle or Local Data)
Use the built-in trainer to create a model file consumed by `CLASSIFIER_MODE=model`.

1. Prepare an input file:
   - Local capture file: `backend/app/data/gesture_samples.jsonl`
   - Or CSV export containing `label` (or `intent`/`character`) and landmark features.
2. Run training:
   - `python scripts/train_intent_model.py --input app/data/gesture_samples.jsonl --labels yes,no,pain,water,help,stop`
3. For Kaggle fingerspelling data, map character labels:
   - `python scripts/train_intent_model.py --input "<your_export>.csv" --labels yes,no --map y=yes --map n=no`
4. Start API with model mode:
   - `CLASSIFIER_MODE=model`
   - `MODEL_FILE=app/data/models/gesture_centroid_model.json`

## Documentation
See the repository docs index: [docs/README.md](../docs/README.md).


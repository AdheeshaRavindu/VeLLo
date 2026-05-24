# Backend (FastAPI)

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

## Detection Tuning
- Default classifier mode is rule-based.
- Optional environment variable:
  - `CLASSIFIER_MODE=rule` (default)
  - `CLASSIFIER_MODE=model` (uses trained model path, then falls back to rules)
- Optional model file path:
  - `MODEL_FILE=app/data/models/gesture_centroid_model.json`
- Current single-sign setup expects ASL-style `yes`:
  - Closed fist handshape
  - Short up/down nodding motion over recent frames

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
   - `python scripts/train_intent_model.py --input app/data/gesture_samples.jsonl --labels yes,no`
3. For Kaggle fingerspelling data, map character labels:
   - `python scripts/train_intent_model.py --input "<your_export>.csv" --labels yes,no --map y=yes --map n=no`
4. Start API with model mode:
   - `CLASSIFIER_MODE=model`
   - `MODEL_FILE=app/data/models/gesture_centroid_model.json`

  ## Documentation
  See the repository docs index: [docs/README.md](../docs/README.md).


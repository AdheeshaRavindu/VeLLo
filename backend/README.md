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
  - `CLASSIFIER_MODE=model` (uses model path, then falls back to rules)
- Current single-sign setup expects ASL-style `yes`:
  - Closed fist handshape
  - Short up/down nodding motion over recent frames

## Training Data Capture
`POST /api/detect` accepts optional fields:
- `capture_sample` (boolean)
- `capture_label` (active intent)

If enabled, labeled samples are appended to:
- `backend/app/data/gesture_samples.jsonl`


# Hospital Sign-to-Voice Assistant

Hackathon MVP for hospital accessibility: predefined sign gestures to spoken voice.

## Stack
- Frontend: Next.js + TypeScript + TailwindCSS
- Backend: FastAPI + OpenCV + MediaPipe
- Voice: ElevenLabs API (with browser speech fallback)

## MVP Features
- Live camera feed
- Hand landmark detection
- Predefined intent classification
- Phrase mapping
- Voice output
- Demo mode fallback

## Docker (Contributor Setup)
Use Docker Compose so contributors do not need local Python/Node setup.

### Prerequisites
- Docker Desktop installed and running
- Ports `3000` and `8000` available

### Start full stack
From project root:

```powershell
docker compose up --build
```

Note: frontend runtime cache (`.next`) is isolated in a container volume to avoid host/container cache mismatch errors during hot reload.

### Open app
- Frontend: `http://localhost:3000`
- Detection screen: `http://localhost:3000/detect`
- Backend health: `http://localhost:8000/health`

### Stop stack
In the same terminal:

```powershell
Ctrl + C
```

Or detached mode:

```powershell
docker compose up -d --build
docker compose down
```

### Rebuild after dependency changes
```powershell
docker compose build --no-cache
docker compose up
```


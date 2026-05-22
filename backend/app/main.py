from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.detect import router as detect_router
from app.routes.health import router as health_router
from app.routes.voice import router as voice_router
from app.services.auto_train_service import maybe_train_help_model

app = FastAPI(title="Hospital Sign-to-Voice API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(detect_router)
app.include_router(voice_router)


# Kick off optional background auto-training for the help detector.
maybe_train_help_model(background=True)


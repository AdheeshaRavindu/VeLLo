import os
import threading
import time
from pathlib import Path
from typing import Optional

from app.utils.config import get_env

# Reuse existing scripts
from ...scripts.generate_synthetic_help_data import generate as generate_synthetic
from ...scripts.train_help_detector import main as train_main


ROOT = Path(__file__).resolve().parents[2]
DATA_CSV = ROOT / 'data' / 'help_samples.csv'
MODEL_PATH = ROOT / 'models' / 'help_detector.pkl'


def _has_enough_data(min_rows: int = 200) -> bool:
    if not DATA_CSV.exists():
        return False
    try:
        # Count lines excluding header
        with open(DATA_CSV, 'r', encoding='utf-8') as f:
            lines = sum(1 for _ in f) - 1
        return lines >= min_rows
    except Exception:
        return False


def maybe_train_help_model(background: bool = True, min_rows: int = 200) -> None:
    """Train the help model if missing or insufficient data.

    If AUTO_TRAIN is true, will generate synthetic data when needed and run training.
    """
    def _work():
        auto = get_env('AUTO_TRAIN', 'true').lower() in ('1', 'true', 'yes')
        if not auto:
            return

        # If model exists and is newer than data, skip
        if MODEL_PATH.exists() and DATA_CSV.exists():
            try:
                if MODEL_PATH.stat().st_mtime > DATA_CSV.stat().st_mtime:
                    return
            except Exception:
                pass

        # Ensure we have data; generate synthetic if needed
        if not _has_enough_data(min_rows=min_rows):
            # generate a modest synthetic dataset
            try:
                print('Auto-train: generating synthetic data...')
                generate_synthetic(n_per_class=250)
            except Exception as e:
                print('Auto-train: synthetic generation failed:', e)

        # Run training
        try:
            print('Auto-train: starting training...')
            train_main()
            print('Auto-train: training complete')
        except Exception as e:
            print('Auto-train: training failed:', e)

    if background:
        thread = threading.Thread(target=_work, daemon=True)
        thread.start()
    else:
        _work()

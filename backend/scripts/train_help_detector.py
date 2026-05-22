"""Train a small classifier on landmark CSV exported by collect_help_samples.py

Usage:
    python train_help_detector.py
"""
import os
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler


ROOT = Path(__file__).resolve().parents[1]
DATA_CSV = ROOT / 'data' / 'help_samples.csv'
OUT_MODEL = ROOT / 'models' / 'help_detector.pkl'


def load_data(path: Path):
    df = pd.read_csv(path)
    # label column
    y = (df['label'] == 'help').astype(int).values
    X = df.drop(columns=['label', 'timestamp']).fillna(0.0).values
    return X, y


def main():
    if not DATA_CSV.exists():
        raise SystemExit(f'No data found at {DATA_CSV}. Run collect_help_samples first.')
    X, y = load_data(DATA_CSV)
    X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

    clf = Pipeline([
        ('scaler', StandardScaler()),
        ('mlp', MLPClassifier(hidden_layer_sizes=(128,64), max_iter=500, random_state=42))
    ])
    print('Training on', X_train.shape[0], 'samples')
    clf.fit(X_train, y_train)
    val_score = clf.score(X_val, y_val)
    print('Validation accuracy:', val_score)

    OUT_MODEL.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({'clf': clf}, OUT_MODEL)
    print('Saved model to', OUT_MODEL)


if __name__ == '__main__':
    main()

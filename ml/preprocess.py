import os
import sys
import json
from pathlib import Path
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import RobustScaler

# Add project root to sys.path
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.config import (
    DATASET_PATH,
    ML_DIR,
    BACKEND_DIR,
    FEATURE_COLUMNS,
    TARGET_COLUMN,
    ARTIFACTS_DIR as BACKEND_ARTIFACTS_DIR,
)

ML_ARTIFACTS_DIR = ML_DIR / "artifacts"
ML_ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
BACKEND_ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)


def load_raw_dataset(csv_path: Path = DATASET_PATH) -> pd.DataFrame:
    """Loads and returns the raw credit card dataset."""
    if not csv_path.exists():
        raise FileNotFoundError(f"Dataset not found at {csv_path}. Run python ml/fetch_dataset.py first.")
    df = pd.read_csv(csv_path)
    return df


def preprocess_data(
    df: pd.DataFrame = None, 
    test_size: float = 0.20, 
    random_state: int = 42
):
    """
    Executes reproducible, leak-free preprocessing:
    1. Splits dataset into stratified train and test partitions (80/20).
    2. Fits RobustScaler ONLY on X_train (for Time and Amount), transforms X_train and X_test.
    3. Leaves V1..V28 intact (already PCA-transformed zero-mean unit-variance components).
    4. Saves scaler and metadata artifacts.
    """
    if df is None:
        df = load_raw_dataset()

    print(f"\n[Preprocessing] Total dataset records: {len(df):,}")
    print(f"[Preprocessing] Features: {len(FEATURE_COLUMNS)} | Target: '{TARGET_COLUMN}'")

    X = df[FEATURE_COLUMNS].copy()
    y = df[TARGET_COLUMN].copy()

    # Stratified Train-Test Split (prevents data leakage before scaling or balancing)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )

    print(f"[Preprocessing] Train records: {len(X_train):,} (Legitimate: {sum(y_train==0):,}, Fraud: {sum(y_train==1):,})")
    print(f"[Preprocessing] Test records : {len(X_test):,} (Legitimate: {sum(y_test==0):,}, Fraud: {sum(y_test==1):,})")

    # Fit RobustScaler ONLY on X_train['Time', 'Amount']
    scaler = RobustScaler()
    cols_to_scale = ["Time", "Amount"]
    scaler.fit(X_train[cols_to_scale])

    # Transform Train and Test
    X_train_scaled = X_train.copy()
    X_test_scaled = X_test.copy()
    X_train_scaled[cols_to_scale] = scaler.transform(X_train[cols_to_scale])
    X_test_scaled[cols_to_scale] = scaler.transform(X_test[cols_to_scale])

    # Save Scaler artifact to both ML and Backend artifact directories
    scaler_ml_path = ML_ARTIFACTS_DIR / "scaler.joblib"
    scaler_backend_path = BACKEND_ARTIFACTS_DIR / "scaler.joblib"
    joblib.dump(scaler, scaler_ml_path)
    joblib.dump(scaler, scaler_backend_path)
    print(f"[Preprocessing] Scaler artifact saved to {scaler_ml_path} and {scaler_backend_path}")

    # Save feature schema
    schema = {
        "feature_names": FEATURE_COLUMNS,
        "scaled_features": cols_to_scale,
        "pca_features": [f"V{i}" for i in range(1, 29)],
        "target": TARGET_COLUMN,
        "classes": [0, 1],
        "class_labels": {0: "Legitimate", 1: "Fraudulent"},
    }
    with open(ML_ARTIFACTS_DIR / "feature_schema.json", "w", encoding="utf-8") as f:
        json.dump(schema, f, indent=2)
    with open(BACKEND_ARTIFACTS_DIR / "feature_schema.json", "w", encoding="utf-8") as f:
        json.dump(schema, f, indent=2)

    # Save metadata summary
    metadata = {
        "train_samples": int(len(X_train)),
        "test_samples": int(len(X_test)),
        "train_legit": int(sum(y_train == 0)),
        "train_fraud": int(sum(y_train == 1)),
        "test_legit": int(sum(y_test == 0)),
        "test_fraud": int(sum(y_test == 1)),
        "test_size_fraction": test_size,
        "random_state": random_state,
        "scaling_method": "RobustScaler (Time, Amount)",
        "fraud_percentage_train": round((sum(y_train == 1) / len(y_train)) * 100, 4),
        "fraud_percentage_test": round((sum(y_test == 1) / len(y_test)) * 100, 4),
    }
    with open(ML_ARTIFACTS_DIR / "preprocessing_summary.json", "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    with open(BACKEND_ARTIFACTS_DIR / "preprocessing_summary.json", "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    # Save processed test set sample for quick API testing and monitoring simulation feed
    # Save a balanced preview sample (e.g., 200 legitimate + 50 fraud from test set)
    test_fraud_indices = y_test[y_test == 1].index
    test_legit_indices = y_test[y_test == 0].sample(n=min(500, sum(y_test == 0)), random_state=random_state).index
    preview_indices = list(test_legit_indices) + list(test_fraud_indices)
    sample_df = df.loc[preview_indices].sample(frac=1.0, random_state=random_state)
    sample_df.to_csv(ML_ARTIFACTS_DIR / "simulation_sample.csv", index=False)
    sample_df.to_csv(BACKEND_ARTIFACTS_DIR / "simulation_sample.csv", index=False)
    print(f"[Preprocessing] Simulation sample dataset (598 transactions) saved for real-time monitoring.")

    print(f"[Preprocessing] Preprocessing completed successfully.\n")
    return X_train_scaled, X_test_scaled, y_train, y_test, scaler


if __name__ == "__main__":
    preprocess_data()

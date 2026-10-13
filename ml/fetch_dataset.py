import os
import sys
import shutil
import json
from pathlib import Path
import pandas as pd
import numpy as np

# Add project root to sys.path
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.config import (
    ML_DATA_DIR,
    DEFAULT_DATASET_NAME,
    DATASET_PATH,
    FEATURE_COLUMNS,
    TARGET_COLUMN,
    ALL_COLUMNS,
)

VALIDATION_SUMMARY_PATH = ML_DATA_DIR / "dataset_validation.json"


def validate_dataset(csv_path: Path) -> dict:
    """Validates the schema, row counts, missing values, and class distribution of the dataset."""
    print(f"\n[CreditGuard Validation] Validating dataset at: {csv_path}")
    if not csv_path.exists():
        return {
            "status": "missing",
            "file_path": str(csv_path),
            "message": "Dataset file not found.",
        }

    file_size_mb = round(os.path.getsize(csv_path) / (1024 * 1024), 2)
    print(f"File Size: {file_size_mb} MB")

    # Read dataset header and sample first, then read full
    df = pd.read_csv(csv_path)
    total_rows = len(df)
    total_cols = len(df.columns)

    missing_cols = [c for c in ALL_COLUMNS if c not in df.columns]
    extra_cols = [c for c in df.columns if c not in ALL_COLUMNS]

    if missing_cols:
        return {
            "status": "invalid_schema",
            "file_path": str(csv_path),
            "missing_columns": missing_cols,
            "message": f"Dataset is missing required columns: {missing_cols}",
        }

    null_counts = df.isnull().sum().to_dict()
    total_nulls = int(df.isnull().sum().sum())
    duplicate_count = int(df.duplicated().sum())

    class_counts = df[TARGET_COLUMN].value_counts().to_dict()
    legit_count = int(class_counts.get(0, 0))
    fraud_count = int(class_counts.get(1, 0))
    fraud_percentage = round((fraud_count / total_rows) * 100, 4) if total_rows > 0 else 0.0

    amount_stats = {
        "min": float(df["Amount"].min()),
        "max": float(df["Amount"].max()),
        "mean": round(float(df["Amount"].mean()), 2),
        "median": round(float(df["Amount"].median()), 2),
        "std": round(float(df["Amount"].std()), 2),
    }

    validation_result = {
        "status": "valid",
        "file_path": str(csv_path),
        "file_size_mb": file_size_mb,
        "total_rows": total_rows,
        "total_columns": total_cols,
        "columns": list(df.columns),
        "total_nulls": total_nulls,
        "duplicate_count": duplicate_count,
        "legitimate_count": legit_count,
        "fraud_count": fraud_count,
        "fraud_percentage": fraud_percentage,
        "amount_statistics": amount_stats,
        "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()},
    }

    # Save validation metadata
    with open(VALIDATION_SUMMARY_PATH, "w", encoding="utf-8") as f:
        json.dump(validation_result, f, indent=2)

    print("\n--- DATASET VALIDATION REPORT ---")
    print(f"Total Transactions : {total_rows:,}")
    print(f"Total Columns      : {total_cols}")
    print(f"Legitimate (Class 0): {legit_count:,} ({100 - fraud_percentage:.2f}%)")
    print(f"Fraudulent (Class 1): {fraud_count:,} ({fraud_percentage:.4f}%)")
    print(f"Duplicate Rows     : {duplicate_count:,}")
    print(f"Missing Values     : {total_nulls}")
    print(f"Transaction Amount : Min ${amount_stats['min']:.2f}, Mean ${amount_stats['mean']:.2f}, Max ${amount_stats['max']:.2f}")
    print("---------------------------------")
    print(f"Validation summary saved to: {VALIDATION_SUMMARY_PATH}\n")
    return validation_result


def generate_synthetic_benchmark(target_path: Path, n_samples: int = 10000, fraud_ratio: float = 0.00173):
    """
    Generates a synthetic dataset adhering precisely to the Kaggle creditcard.csv schema
    (Time, V1..V28, Amount, Class) for unit tests or offline verification.
    """
    print(f"[CreditGuard] Generating representative synthetic dataset ({n_samples} rows)...")
    np.random.seed(42)
    n_fraud = max(1, int(n_samples * fraud_ratio))
    n_legit = n_samples - n_fraud

    # Normal transactions: V1-V28 standard normal
    legit_features = np.random.normal(loc=0.0, scale=1.0, size=(n_legit, 28))
    legit_time = np.sort(np.random.uniform(0, 172800, size=n_legit))
    legit_amount = np.random.exponential(scale=88.0, size=n_legit)
    legit_class = np.zeros(n_legit, dtype=int)

    # Fraud transactions: shift distribution on key features like V1, V2, V3, V4, V14, V17
    fraud_features = np.random.normal(loc=0.0, scale=1.2, size=(n_fraud, 28))
    fraud_features[:, 0] -= 2.5  # V1
    fraud_features[:, 1] += 2.0  # V2
    fraud_features[:, 2] -= 3.0  # V3
    fraud_features[:, 3] += 2.5  # V4
    fraud_features[:, 13] -= 4.0 # V14
    fraud_features[:, 16] -= 3.5 # V17
    fraud_time = np.sort(np.random.uniform(0, 172800, size=n_fraud))
    fraud_amount = np.random.exponential(scale=122.0, size=n_fraud)
    fraud_class = np.ones(n_fraud, dtype=int)

    legit_df = pd.DataFrame(legit_features, columns=[f"V{i}" for i in range(1, 29)])
    legit_df["Time"] = legit_time
    legit_df["Amount"] = legit_amount
    legit_df["Class"] = legit_class

    fraud_df = pd.DataFrame(fraud_features, columns=[f"V{i}" for i in range(1, 29)])
    fraud_df["Time"] = fraud_time
    fraud_df["Amount"] = fraud_amount
    fraud_df["Class"] = fraud_class

    df = pd.concat([legit_df, fraud_df], ignore_index=True)
    # Reorder columns to exact schema
    df = df[["Time"] + [f"V{i}" for i in range(1, 29)] + ["Amount", "Class"]]
    df = df.sample(frac=1.0, random_state=42).reset_index(drop=True)

    target_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(target_path, index=False)
    print(f"[CreditGuard] Synthetic benchmark written to: {target_path}")
    return validate_dataset(target_path)


def fetch_dataset(force: bool = False, use_synthetic_fallback: bool = False):
    """
    Acquires the dataset:
    1. Checks if ml/data/creditcard.csv exists.
    2. Attempts kagglehub download if missing.
    3. If kagglehub download fails or network is offline, provides instructions
       or optionally falls back to synthetic benchmark if requested.
    """
    ML_DATA_DIR.mkdir(parents=True, exist_ok=True)
    target_csv = DATASET_PATH

    if target_csv.exists() and not force:
        print(f"[CreditGuard] Dataset already exists at: {target_csv}")
        return validate_dataset(target_csv)

    print("[CreditGuard] Dataset not found locally. Attempting automatic download via kagglehub...")
    try:
        import kagglehub
        downloaded_path = kagglehub.dataset_download("mlg-ulb/creditcardfraud")
        print(f"[CreditGuard] Kagglehub downloaded archive to: {downloaded_path}")

        # Search for creditcard.csv inside downloaded directory
        candidate_csv = None
        for root, _, files in os.walk(downloaded_path):
            for file in files:
                if file.lower() == "creditcard.csv":
                    candidate_csv = Path(root) / file
                    break

        if candidate_csv and candidate_csv.exists():
            print(f"[CreditGuard] Copying {candidate_csv} to {target_csv}...")
            shutil.copy2(candidate_csv, target_csv)
            print("[CreditGuard] Copy completed successfully.")
            return validate_dataset(target_csv)
        else:
            print(f"[CreditGuard] Could not locate creditcard.csv in downloaded folder: {downloaded_path}")
    except Exception as e:
        print(f"[CreditGuard Warning] Automated download encountered an error: {e}")

    # If automated download didn't succeed
    if use_synthetic_fallback:
        print("[CreditGuard] Using synthetic benchmark fallback as requested.")
        return generate_synthetic_benchmark(target_csv)

    print("\n" + "=" * 70)
    print("MANUAL DATASET DOWNLOAD INSTRUCTIONS:")
    print("1. Visit: https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud")
    print("2. Download the 'archive.zip' file and extract 'creditcard.csv'.")
    print(f"3. Place 'creditcard.csv' into: {target_csv.resolve()}")
    print("4. Re-run: python ml/fetch_dataset.py")
    print("=" * 70 + "\n")
    return {"status": "missing", "file_path": str(target_csv)}


if __name__ == "__main__":
    force_fetch = "--force" in sys.argv
    synth = "--synthetic" in sys.argv
    fetch_dataset(force=force_fetch, use_synthetic_fallback=synth)

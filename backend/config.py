import os
from pathlib import Path

# Base Paths
BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent
ML_DIR = PROJECT_ROOT / "ml"
ML_DATA_DIR = ML_DIR / "data"
ARTIFACTS_DIR = BACKEND_DIR / "artifacts"
UPLOADS_DIR = BACKEND_DIR / "uploads"
DB_PATH = BACKEND_DIR / "creditguard.sqlite3"

# Ensure directories exist
ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
ML_DATA_DIR.mkdir(parents=True, exist_ok=True)

# Dataset path
DEFAULT_DATASET_NAME = "creditcard.csv"
DATASET_PATH = Path(os.getenv("DATASET_PATH", ML_DATA_DIR / DEFAULT_DATASET_NAME))

# Server Config
HOST = os.getenv("BACKEND_HOST", "127.0.0.1")
PORT = int(os.getenv("BACKEND_PORT", 5000))
DEBUG = os.getenv("FLASK_DEBUG", "True").lower() in ("true", "1", "yes")

# CORS
CORS_ORIGINS = os.getenv(
    "CORS_ORIGINS", 
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"
).split(",")

# Dataset Schema Constants
FEATURE_COLUMNS = ["Time"] + [f"V{i}" for i in range(1, 29)] + ["Amount"]
TARGET_COLUMN = "Class"
ALL_COLUMNS = FEATURE_COLUMNS + [TARGET_COLUMN]

# Models configuration
SUPPORTED_MODELS = [
    "Random Forest",
    "Logistic Regression",
    "Decision Tree",
    "K-Nearest Neighbors"
]
DEFAULT_MODEL_NAME = "Random Forest"
DEFAULT_DECISION_THRESHOLD = 0.5

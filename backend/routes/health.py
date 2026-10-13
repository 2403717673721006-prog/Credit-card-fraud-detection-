import datetime
from flask import Blueprint, jsonify
from backend.config import DATASET_PATH, ARTIFACTS_DIR

health_bp = Blueprint("health", __name__)


@health_bp.route("/health", methods=["GET"])
def health_check():
    dataset_ready = DATASET_PATH.exists() or (ARTIFACTS_DIR / "simulation_sample.csv").exists()
    model_ready = (ARTIFACTS_DIR / "selected_model.joblib").exists()
    scaler_ready = (ARTIFACTS_DIR / "scaler.joblib").exists()


    return jsonify({
        "status": "healthy",
        "service": "CreditGuard Fraud Detection Engine",
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "readiness": {
            "dataset_available": dataset_ready,
            "models_trained": model_ready,
            "scaler_ready": scaler_ready,
            "all_systems_operational": dataset_ready and model_ready and scaler_ready,
        },
    }), 200

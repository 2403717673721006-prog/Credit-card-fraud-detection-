import json
from flask import Blueprint, jsonify, send_from_directory
from backend.config import ARTIFACTS_DIR, SUPPORTED_MODELS
from backend.services.model_service import model_service

models_bp = Blueprint("models", __name__)


@models_bp.route("/models/comparison", methods=["GET"])
def get_models_comparison():
    """Returns comparative metrics for all 4 trained machine learning algorithms."""
    comparison = model_service.get_comparison()
    return jsonify(comparison), 200


@models_bp.route("/models/schema", methods=["GET"])
def get_feature_schema():
    """Returns the expected feature schema and input definitions."""
    schema = model_service.get_schema()
    return jsonify(schema), 200


@models_bp.route("/models/list", methods=["GET"])
def get_supported_models():
    """Returns list of supported algorithms."""
    return jsonify({"models": SUPPORTED_MODELS}), 200


@models_bp.route("/models/plots/<filename>", methods=["GET"])
def get_model_plot(filename: str):
    """Serves generated model evaluation plots (PNG)."""
    allowed_plots = [
        "model_metrics_comparison.png",
        "confusion_matrices_comparison.png",
    ]
    if filename not in allowed_plots:
        return jsonify({"error": "Plot not permitted or not found."}), 404
    return send_from_directory(str(ARTIFACTS_DIR), filename)

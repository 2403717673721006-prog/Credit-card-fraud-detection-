import json
from flask import Blueprint, jsonify, send_from_directory
from backend.config import ARTIFACTS_DIR

eda_bp = Blueprint("eda", __name__)


@eda_bp.route("/eda/summary", methods=["GET"])
def get_eda_summary():
    """Returns exploratory data analysis summary JSON."""
    eda_json_path = ARTIFACTS_DIR / "eda_summary.json"
    if not eda_json_path.exists():
        return jsonify({
            "status": "not_generated",
            "message": "EDA summary not found. Run python ml/eda.py to generate insights."
        }), 404

    with open(eda_json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return jsonify(data), 200


@eda_bp.route("/eda/plots/<filename>", methods=["GET"])
def get_eda_plot(filename: str):
    """Serves generated EDA plots (PNG)."""
    allowed_plots = [
        "class_distribution.png",
        "amount_distribution.png",
        "correlation_summary.png",
    ]
    if filename not in allowed_plots:
        return jsonify({"error": "Plot not permitted or not found."}), 404
    return send_from_directory(str(ARTIFACTS_DIR), filename)

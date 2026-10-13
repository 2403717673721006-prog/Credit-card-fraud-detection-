import json
from flask import Blueprint, jsonify, request
from backend.services.model_service import model_service
from backend.models.database import record_prediction, get_prediction_history, get_prediction_stats

predict_bp = Blueprint("predict", __name__)


@predict_bp.route("/predict", methods=["POST"])
def predict_transaction():
    """
    Evaluates a single transaction through the machine learning model.
    Payload:
    {
        "features": { "Time": 0.0, "V1": ..., "Amount": 100.0 },
        "model_name": "Random Forest",
        "threshold": 0.5,
        "source": "manual" | "dataset_row",
        "ground_truth_class": 0 | 1 | null
    }
    """
    payload = request.get_json(silent=True)
    if not payload:
        return jsonify({"error": "Invalid request. JSON body is required."}), 400

    features = payload.get("features")
    if not isinstance(features, dict):
        return jsonify({"error": "Invalid request. 'features' must be an object with feature values."}), 400

    model_name = payload.get("model_name", None)
    threshold = payload.get("threshold", 0.5)
    source = payload.get("source", "manual")
    ground_truth = payload.get("ground_truth_class", None)

    try:
        threshold = float(threshold)
    except (ValueError, TypeError):
        threshold = 0.5

    try:
        result = model_service.predict(
            features=features,
            model_name=model_name,
            threshold=threshold,
        )
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except FileNotFoundError as fe:
        return jsonify({"error": str(fe)}), 503
    except Exception as e:
        return jsonify({"error": f"Inference execution failed: {str(e)}"}), 500

    # Store prediction into SQLite
    try:
        pred_id = record_prediction(
            amount=result["amount"],
            predicted_class=result["predicted_class"],
            risk_score=result["risk_score"],
            decision_threshold=result["decision_threshold"],
            model_name=result["model_name"],
            source=source,
            ground_truth_class=int(ground_truth) if ground_truth is not None else None,
            features_json=json.dumps(features),
        )
        result["prediction_id"] = pred_id
    except Exception as e:
        print(f"[Predict Logging Warning]: {e}")
        result["prediction_id"] = "TX-TEMP"

    return jsonify(result), 200


@predict_bp.route("/predictions/history", methods=["GET"])
def prediction_history():
    """Returns persistent prediction audit trail stored in SQLite."""
    limit = request.args.get("limit", 50, type=int)
    offset = request.args.get("offset", 0, type=int)
    limit = max(1, min(100, limit))
    offset = max(0, offset)

    history = get_prediction_history(limit=limit, offset=offset)
    stats = get_prediction_stats()

    return jsonify({
        "history": history,
        "stats": stats,
        "limit": limit,
        "offset": offset,
    }), 200

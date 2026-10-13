from flask import Blueprint, jsonify, request
from backend.services.monitoring_service import monitoring_service

monitoring_bp = Blueprint("monitoring", __name__)


@monitoring_bp.route("/monitoring/status", methods=["GET"])
def get_status():
    """Returns real-time transaction monitoring metrics, counters, and event streams."""
    status = monitoring_service.get_status()
    return jsonify(status), 200


@monitoring_bp.route("/monitoring/start", methods=["POST"])
def start_simulation():
    """Starts or resumes the transaction simulation stream."""
    payload = request.get_json(silent=True) or {}
    interval = payload.get("interval_seconds", 1.0)
    threshold = payload.get("threshold", 0.5)
    model_name = payload.get("model_name", None)

    status = monitoring_service.start(
        interval_seconds=interval,
        threshold=threshold,
        model_name=model_name,
    )
    return jsonify(status), 200


@monitoring_bp.route("/monitoring/pause", methods=["POST"])
def pause_simulation():
    """Pauses the simulation stream without resetting metrics."""
    status = monitoring_service.pause()
    return jsonify(status), 200


@monitoring_bp.route("/monitoring/resume", methods=["POST"])
def resume_simulation():
    """Resumes the simulation stream from a paused state."""
    status = monitoring_service.resume()
    return jsonify(status), 200


@monitoring_bp.route("/monitoring/reset", methods=["POST"])
def reset_simulation():
    """Stops the worker thread and resets all counters and streaming buffers."""
    status = monitoring_service.reset()
    return jsonify(status), 200

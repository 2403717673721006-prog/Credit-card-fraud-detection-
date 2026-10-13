from flask import Blueprint, jsonify, request
from backend.services.dataset_service import dataset_service

dataset_bp = Blueprint("dataset", __name__)


@dataset_bp.route("/dataset/summary", methods=["GET"])
def dataset_summary():
    """Returns dataset summary metrics, validation status, row/column counts."""
    summary = dataset_service.get_summary()
    return jsonify(summary), 200


@dataset_bp.route("/dataset/transactions", methods=["GET"])
def list_transactions():
    """
    Returns paginated, sorted, and filtered transaction records.
    Query parameters:
    - page: int (default 1)
    - per_page: int (default 20, max 100)
    - class_filter: int (0 or 1, optional)
    - min_amount: float (optional)
    - max_amount: float (optional)
    - sort_by: str (default 'Time')
    - sort_order: str ('asc' or 'desc', default 'desc')
    - search: str (optional)
    """
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)
    class_filter = request.args.get("class_filter", None, type=int)
    min_amount = request.args.get("min_amount", None, type=float)
    max_amount = request.args.get("max_amount", None, type=float)
    sort_by = request.args.get("sort_by", "Time", type=str)
    sort_order = request.args.get("sort_order", "desc", type=str)
    search = request.args.get("search", None, type=str)

    data = dataset_service.get_transactions(
        page=page,
        per_page=per_page,
        class_filter=class_filter,
        min_amount=min_amount,
        max_amount=max_amount,
        sort_by=sort_by,
        sort_order=sort_order,
        search=search,
    )
    return jsonify(data), 200


@dataset_bp.route("/dataset/transactions/<tx_id>", methods=["GET"])
def get_transaction(tx_id: str):
    """Returns complete details of a single transaction by ID."""
    tx = dataset_service.get_transaction_by_id(tx_id)
    if not tx:
        return jsonify({"error": f"Transaction '{tx_id}' not found."}), 404
    return jsonify(tx), 200

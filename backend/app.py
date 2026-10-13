import os
import sys
from pathlib import Path
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

# Add project root to sys.path
BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.config import HOST, PORT, DEBUG, CORS_ORIGINS
from backend.models.database import init_db
from backend.routes.health import health_bp
from backend.routes.dataset import dataset_bp
from backend.routes.eda import eda_bp
from backend.routes.models import models_bp
from backend.routes.predict import predict_bp
from backend.routes.monitoring import monitoring_bp


def create_app():
    """Application factory for CreditGuard backend."""
    app = Flask(__name__)

    # Enable Cross-Origin Resource Sharing
    CORS(
        app,
        resources={r"/api/*": {"origins": "*"}},
        supports_credentials=True,
    )

    # Initialize SQLite database
    init_db()

    # Register blueprints under /api prefix
    app.register_blueprint(health_bp, url_prefix="/api")
    app.register_blueprint(dataset_bp, url_prefix="/api")
    app.register_blueprint(eda_bp, url_prefix="/api")
    app.register_blueprint(models_bp, url_prefix="/api")
    app.register_blueprint(predict_bp, url_prefix="/api")
    app.register_blueprint(monitoring_bp, url_prefix="/api")

    # Serve built React frontend from frontend/dist if present
    frontend_dist = PROJECT_ROOT / "frontend" / "dist"
    if frontend_dist.exists():
        @app.route("/", defaults={"path": ""})
        @app.route("/<path:path>")
        def serve_frontend(path):
            if path and (frontend_dist / path).exists():
                return send_from_directory(str(frontend_dist), path)
            return send_from_directory(str(frontend_dist), "index.html")

    @app.errorhandler(404)
    def handle_not_found(e):
        if request.path.startswith("/api/"):
            return jsonify({"error": "Resource not found", "status": 404}), 404
        if frontend_dist.exists():
            return send_from_directory(str(frontend_dist), "index.html")
        return jsonify({"error": "Resource not found", "status": 404}), 404

    @app.errorhandler(400)
    def handle_bad_request(e):
        return jsonify({"error": "Bad request", "details": str(e), "status": 400}), 400

    @app.errorhandler(500)
    def handle_server_error(e):
        return jsonify({"error": "Internal server error occurred", "status": 500}), 500

    return app


app = create_app()

if __name__ == "__main__":
    print(f"\n=======================================================")
    print(f" CREDITGUARD REST API SERVER STARTING")
    print(f" Endpoint: http://{HOST}:{PORT}/api/health")
    print(f" CORS Allowed Origins: {CORS_ORIGINS}")
    print(f"=======================================================\n")
    app.run(host=HOST, port=PORT, debug=DEBUG)

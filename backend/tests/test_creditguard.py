import json
import pytest
from backend.app import create_app
from backend.config import FEATURE_COLUMNS


@pytest.fixture
def client():
    app = create_app()
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "healthy"
    assert "readiness" in data
    assert data["readiness"]["dataset_available"] is True
    assert data["readiness"]["models_trained"] is True


def test_dataset_summary(client):
    response = client.get("/api/dataset/summary")
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "valid"
    assert data["total_rows"] == 284807
    assert data["fraud_count"] == 492
    assert data["legitimate_count"] == 284315


def test_dataset_transactions_pagination(client):
    response = client.get("/api/dataset/transactions?page=1&per_page=10")
    assert response.status_code == 200
    data = response.get_json()
    assert len(data["items"]) == 10
    assert data["page"] == 1
    assert data["per_page"] == 10
    assert data["total"] == 284807

    # Check that transaction contains ground truth actual class
    first_tx = data["items"][0]
    assert "actual_class" in first_tx
    assert "amount" in first_tx
    assert "key_features" in first_tx


def test_models_comparison(client):
    response = client.get("/api/models/comparison")
    assert response.status_code == 200
    data = response.get_json()
    assert "selected_model" in data
    assert "models" in data
    models = data["models"]
    assert "Random Forest" in models
    assert "Logistic Regression" in models
    assert "Decision Tree" in models
    assert "K-Nearest Neighbors" in models

    rf = models["Random Forest"]
    assert rf["accuracy"] > 0.99
    assert rf["recall"] > 0.80
    assert rf["precision"] > 0.70


def test_predict_valid_payload(client):
    # Sample legitimate transaction vector
    sample_features = {col: 0.0 for col in FEATURE_COLUMNS}
    sample_features["Time"] = 100.0
    sample_features["Amount"] = 45.50

    response = client.post(
        "/api/predict",
        data=json.dumps({"features": sample_features, "model_name": "Random Forest", "threshold": 0.5}),
        content_type="application/json",
    )
    assert response.status_code == 200
    data = response.get_json()
    assert "predicted_class" in data
    assert data["predicted_class"] in [0, 1]
    assert 0.0 <= data["risk_score"] <= 1.0
    assert "risk_tier" in data
    assert "prediction_id" in data


def test_predict_invalid_missing_feature(client):
    # Omit feature V14
    sample_features = {col: 0.0 for col in FEATURE_COLUMNS if col != "V14"}

    response = client.post(
        "/api/predict",
        data=json.dumps({"features": sample_features}),
        content_type="application/json",
    )
    assert response.status_code == 400
    data = response.get_json()
    assert "error" in data
    assert "Missing required features" in data["error"]


def test_predict_invalid_non_numeric(client):
    sample_features = {col: 0.0 for col in FEATURE_COLUMNS}
    sample_features["Amount"] = "NOT_A_NUMBER"

    response = client.post(
        "/api/predict",
        data=json.dumps({"features": sample_features}),
        content_type="application/json",
    )
    assert response.status_code == 400
    data = response.get_json()
    assert "error" in data


def test_monitoring_controls(client):
    # 1. Check status
    res = client.get("/api/monitoring/status")
    assert res.status_code == 200

    # 2. Start simulation
    res_start = client.post(
        "/api/monitoring/start",
        data=json.dumps({"interval_seconds": 0.5, "threshold": 0.5}),
        content_type="application/json",
    )
    assert res_start.status_code == 200
    status_data = res_start.get_json()
    assert status_data["state"] in ["RUNNING", "PAUSED"]

    # 3. Pause
    res_pause = client.post("/api/monitoring/pause")
    assert res_pause.status_code == 200
    assert res_pause.get_json()["state"] == "PAUSED"

    # 4. Resume
    res_resume = client.post("/api/monitoring/resume")
    assert res_resume.status_code == 200
    assert res_resume.get_json()["state"] == "RUNNING"

    # 5. Reset
    res_reset = client.post("/api/monitoring/reset")
    assert res_reset.status_code == 200
    assert res_reset.get_json()["state"] == "STOPPED"
    assert res_reset.get_json()["metrics"]["total_processed"] == 0


def test_prediction_history(client):
    response = client.get("/api/predictions/history?limit=10")
    assert response.status_code == 200
    data = response.get_json()
    assert "history" in data
    assert "stats" in data

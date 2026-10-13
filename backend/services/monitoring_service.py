import time
import threading
import datetime
from collections import deque
from pathlib import Path
from typing import Dict, Any, List, Optional
import pandas as pd

from backend.config import ARTIFACTS_DIR, DEFAULT_MODEL_NAME, DEFAULT_DECISION_THRESHOLD
from backend.services.model_service import model_service
from backend.models.database import record_prediction


class MonitoringService:
    """
    Thread-safe real-time transaction monitoring simulator.
    Streams actual historical dataset rows through the active ML model,
    maintains bounded sliding-window metrics, and logs predictions to SQLite.
    """

    STATE_STOPPED = "STOPPED"
    STATE_RUNNING = "RUNNING"
    STATE_PAUSED = "PAUSED"

    def __init__(self):
        self._lock = threading.Lock()
        self._state = self.STATE_STOPPED
        self._worker_thread: Optional[threading.Thread] = None
        self._stop_event = threading.Event()
        self._pause_event = threading.Event()

        # Configurable simulation parameters
        self.interval_seconds: float = 1.0
        self.threshold: float = DEFAULT_DECISION_THRESHOLD
        self.model_name: str = DEFAULT_MODEL_NAME

        # Bounded sliding window stores
        self._recent_transactions = deque(maxlen=100)
        self._recent_alerts = deque(maxlen=30)

        # Aggregate counters
        self.total_processed: int = 0
        self.predicted_fraud_count: int = 0
        self.predicted_legit_count: int = 0
        self.ground_truth_fraud_count: int = 0

        # Dataset sample loader for stream
        self._stream_df: Optional[pd.DataFrame] = None
        self._stream_index: int = 0

    def _load_stream_dataset(self) -> pd.DataFrame:
        """Loads simulation sample rows from artifacts."""
        sample_path = ARTIFACTS_DIR / "simulation_sample.csv"
        if sample_path.exists():
            return pd.read_csv(sample_path)
        # Fallback to creating a sample if missing
        from backend.services.dataset_service import dataset_service
        try:
            df = dataset_service._get_dataframe()
            # Sample 200 legit + all fraud
            fraud_rows = df[df["Class"] == 1]
            legit_rows = df[df["Class"] == 0].sample(n=min(500, len(df)), random_state=42)
            combined = pd.concat([legit_rows, fraud_rows]).sample(frac=1.0, random_state=42)
            return combined
        except Exception:
            return pd.DataFrame()

    def start(self, interval_seconds: float = 1.0, threshold: float = 0.5, model_name: Optional[str] = None) -> Dict[str, Any]:
        """Starts or resumes the simulation. Ensures only a single worker runs."""
        with self._lock:
            self.interval_seconds = max(0.2, min(5.0, float(interval_seconds)))
            self.threshold = max(0.01, min(0.99, float(threshold)))
            if model_name:
                self.model_name = model_name

            if self._state == self.STATE_PAUSED:
                self._state = self.STATE_RUNNING
                self._pause_event.clear()
                return self.get_status()

            if self._state == self.STATE_RUNNING:
                return self.get_status()

            # State is STOPPED -> start new worker
            self._stop_event.clear()
            self._pause_event.clear()
            self._state = self.STATE_RUNNING

            if self._stream_df is None or self._stream_df.empty:
                self._stream_df = self._load_stream_dataset()
                self._stream_index = 0

            self._worker_thread = threading.Thread(target=self._run_simulation_loop, daemon=True)
            self._worker_thread.start()

        return self.get_status()

    def pause(self) -> Dict[str, Any]:
        """Pauses the transaction stream."""
        with self._lock:
            if self._state == self.STATE_RUNNING:
                self._state = self.STATE_PAUSED
                self._pause_event.set()
        return self.get_status()

    def resume(self) -> Dict[str, Any]:
        """Resumes a paused simulation."""
        with self._lock:
            if self._state == self.STATE_PAUSED:
                self._state = self.STATE_RUNNING
                self._pause_event.clear()
        return self.get_status()

    def reset(self) -> Dict[str, Any]:
        """Stops the worker and resets all simulation counters and buffers."""
        with self._lock:
            self._stop_event.set()
            self._pause_event.clear()
            self._state = self.STATE_STOPPED
            self._worker_thread = None

            self.total_processed = 0
            self.predicted_fraud_count = 0
            self.predicted_legit_count = 0
            self.ground_truth_fraud_count = 0
            self._recent_transactions.clear()
            self._recent_alerts.clear()
            self._stream_index = 0

        return self.get_status()

    def _run_simulation_loop(self):
        """Simulation worker thread body."""
        while not self._stop_event.is_set():
            if self._pause_event.is_set():
                time.sleep(0.2)
                continue

            if self._stream_df is None or self._stream_df.empty:
                time.sleep(1.0)
                continue

            with self._lock:
                if self._stream_index >= len(self._stream_df):
                    self._stream_index = 0  # Loop back around stream

                row = self._stream_df.iloc[self._stream_index].to_dict()
                self._stream_index += 1

                actual_class = int(row.get("Class", 0))
                features = {k: float(v) for k, v in row.items() if k != "Class"}

                try:
                    pred_res = model_service.predict(
                        features, model_name=self.model_name, threshold=self.threshold
                    )
                except Exception as e:
                    print(f"[Monitoring Simulation Error]: {e}")
                    time.sleep(1.0)
                    continue

                pred_class = pred_res["predicted_class"]
                risk_score = pred_res["risk_score"]
                amount = pred_res["amount"]

                # Update counters
                self.total_processed += 1
                if pred_class == 1:
                    self.predicted_fraud_count += 1
                else:
                    self.predicted_legit_count += 1

                if actual_class == 1:
                    self.ground_truth_fraud_count += 1

                # Generate record entry
                record = {
                    "transaction_id": f"SIM-{self.total_processed:05d}",
                    "timestamp": datetime.datetime.now(datetime.timezone.utc).strftime("%H:%M:%S"),
                    "amount": amount,
                    "predicted_class": pred_class,
                    "prediction_label": pred_res["prediction_label"],
                    "risk_score": risk_score,
                    "risk_tier": pred_res["risk_tier"],
                    "risk_label": pred_res["risk_label"],
                    "actual_class": actual_class,
                    "actual_label": "Fraudulent" if actual_class == 1 else "Legitimate",
                    "model_name": self.model_name,
                    "key_features": {
                        "V1": round(features.get("V1", 0.0), 3),
                        "V2": round(features.get("V2", 0.0), 3),
                        "V14": round(features.get("V14", 0.0), 3),
                        "V17": round(features.get("V17", 0.0), 3),
                    },
                    "is_alert": pred_class == 1,
                }

                self._recent_transactions.appendleft(record)

                if pred_class == 1:
                    self._recent_alerts.appendleft({
                        "alert_id": f"ALT-{len(self._recent_alerts) + 1:04d}",
                        "transaction_id": record["transaction_id"],
                        "timestamp": record["timestamp"],
                        "amount": amount,
                        "risk_score": risk_score,
                        "risk_tier": pred_res["risk_tier"],
                        "actual_class": actual_class,
                        "reason": f"Algorithmic fraud probability ({risk_score*100:.1f}%) crossed decision threshold ({self.threshold*100:.0f}%)",
                    })

                # Persist to SQLite
                try:
                    record_prediction(
                        amount=amount,
                        predicted_class=pred_class,
                        risk_score=risk_score,
                        decision_threshold=self.threshold,
                        model_name=self.model_name,
                        source="simulation",
                        ground_truth_class=actual_class,
                    )
                except Exception:
                    pass

            time.sleep(self.interval_seconds)

    def get_status(self) -> Dict[str, Any]:
        """Returns comprehensive monitoring status and recent event streams."""
        with self._lock:
            alert_rate = (
                round((self.predicted_fraud_count / self.total_processed) * 100, 2)
                if self.total_processed > 0
                else 0.0
            )

            return {
                "state": self._state,
                "interval_seconds": self.interval_seconds,
                "decision_threshold": self.threshold,
                "active_model": self.model_name,
                "metrics": {
                    "total_processed": self.total_processed,
                    "predicted_fraud_count": self.predicted_fraud_count,
                    "predicted_legit_count": self.predicted_legit_count,
                    "ground_truth_fraud_count": self.ground_truth_fraud_count,
                    "fraud_alert_rate": alert_rate,
                },
                "recent_transactions": list(self._recent_transactions),
                "recent_alerts": list(self._recent_alerts),
            }


# Singleton instance
monitoring_service = MonitoringService()

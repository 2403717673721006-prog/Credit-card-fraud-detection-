import sqlite3
import datetime
import uuid
from typing import List, Dict, Any, Optional
from backend.config import DB_PATH


def get_db_connection() -> sqlite3.Connection:
    """Returns a SQLite connection configured with Row factory."""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initializes the database schema if tables do not exist."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS predictions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                prediction_id TEXT UNIQUE NOT NULL,
                timestamp TEXT NOT NULL,
                amount REAL NOT NULL,
                predicted_class INTEGER NOT NULL,
                risk_score REAL NOT NULL,
                decision_threshold REAL NOT NULL,
                model_name TEXT NOT NULL,
                source TEXT NOT NULL,
                is_alert INTEGER NOT NULL,
                ground_truth_class INTEGER,
                features_json TEXT
            )
            """
        )
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_pred_timestamp ON predictions (timestamp DESC)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_pred_is_alert ON predictions (is_alert)")
        conn.commit()


def record_prediction(
    amount: float,
    predicted_class: int,
    risk_score: float,
    decision_threshold: float,
    model_name: str,
    source: str = "manual",
    ground_truth_class: Optional[int] = None,
    features_json: Optional[str] = None,
) -> str:
    """Stores a single prediction event in SQLite."""
    prediction_id = f"TX-{uuid.uuid4().hex[:10].upper()}"
    timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()
    is_alert = 1 if predicted_class == 1 else 0

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO predictions (
                prediction_id, timestamp, amount, predicted_class,
                risk_score, decision_threshold, model_name, source,
                is_alert, ground_truth_class, features_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                prediction_id,
                timestamp,
                amount,
                predicted_class,
                risk_score,
                decision_threshold,
                model_name,
                source,
                is_alert,
                ground_truth_class,
                features_json,
            ),
        )
        conn.commit()
    return prediction_id


def get_prediction_history(limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
    """Retrieves chronological prediction history."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            SELECT id, prediction_id, timestamp, amount, predicted_class,
                   risk_score, decision_threshold, model_name, source,
                   is_alert, ground_truth_class
            FROM predictions
            ORDER BY id DESC
            LIMIT ? OFFSET ?
            """,
            (limit, offset),
        )
        rows = cursor.fetchall()
        return [dict(row) for row in rows]


def get_prediction_stats() -> Dict[str, Any]:
    """Retrieves aggregate statistics for stored predictions."""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as total, SUM(is_alert) as alerts FROM predictions")
        row = cursor.fetchone()
        total = row["total"] if row else 0
        alerts = row["alerts"] if row and row["alerts"] is not None else 0
        return {
            "total_predictions": total,
            "total_alerts": alerts,
            "alert_rate": round((alerts / total * 100), 2) if total > 0 else 0.0,
        }

import os
import json
from pathlib import Path
from typing import Dict, Any, Optional, Tuple
import joblib
import pandas as pd
import numpy as np

from backend.config import (
    ARTIFACTS_DIR,
    FEATURE_COLUMNS,
    DEFAULT_MODEL_NAME,
    DEFAULT_DECISION_THRESHOLD,
    SUPPORTED_MODELS,
)


class ModelService:
    """
    Manages model loading, feature scaling, inference, and threshold calibration.
    Thread-safe model cache prevents disk I/O on every request.
    """

    def __init__(self):
        self._models: Dict[str, Any] = {}
        self._scaler = None
        self._schema = None
        self._comparison = None
        self.load_artifacts()

    def load_artifacts(self):
        """Loads available scaler, schema, and serialized models from ARTIFACTS_DIR."""
        scaler_path = ARTIFACTS_DIR / "scaler.joblib"
        if scaler_path.exists():
            try:
                self._scaler = joblib.load(scaler_path)
            except Exception as e:
                print(f"[ModelService Error] Failed to load scaler: {e}")

        schema_path = ARTIFACTS_DIR / "feature_schema.json"
        if schema_path.exists():
            try:
                with open(schema_path, "r", encoding="utf-8") as f:
                    self._schema = json.load(f)
            except Exception as e:
                print(f"[ModelService Error] Failed to load schema: {e}")

        comp_path = ARTIFACTS_DIR / "model_comparison.json"
        if comp_path.exists():
            try:
                with open(comp_path, "r", encoding="utf-8") as f:
                    self._comparison = json.load(f)
            except Exception as e:
                print(f"[ModelService Error] Failed to load comparison: {e}")

    def _normalize_model_name(self, name: str) -> str:
        """Converts name to standard key, e.g. 'random forest' -> 'Random Forest'."""
        if not name:
            return DEFAULT_MODEL_NAME
        name_lower = name.lower().replace("_", " ").replace("-", " ")
        for standard_name in SUPPORTED_MODELS:
            if standard_name.lower() == name_lower:
                return standard_name
        return DEFAULT_MODEL_NAME

    def get_model(self, model_name: str = DEFAULT_MODEL_NAME):
        """Retrieves or loads the requested model by name."""
        std_name = self._normalize_model_name(model_name)
        if std_name in self._models:
            return self._models[std_name], std_name

        filename = f"{std_name.lower().replace(' ', '_')}.joblib"
        model_path = ARTIFACTS_DIR / filename

        # Fallback to selected_model.joblib if specific model file not found
        if not model_path.exists():
            model_path = ARTIFACTS_DIR / "selected_model.joblib"

        if not model_path.exists():
            raise FileNotFoundError(
                f"Model artifact not found for '{std_name}'. "
                f"Ensure models are trained by running: python ml/train.py"
            )

        model = joblib.load(model_path)
        self._models[std_name] = model
        return model, std_name

    def validate_features(self, input_data: Dict[str, Any]) -> Tuple[pd.DataFrame, Optional[str]]:
        """
        Validates that all expected features are present, non-null, and numeric.
        Returns a 1-row DataFrame or an error message string.
        """
        missing = [col for col in FEATURE_COLUMNS if col not in input_data]
        if missing:
            return None, f"Missing required features: {missing[:5]}{'...' if len(missing) > 5 else ''}"

        row_dict = {}
        for col in FEATURE_COLUMNS:
            val = input_data[col]
            try:
                numeric_val = float(val)
                if np.isnan(numeric_val) or np.isinf(numeric_val):
                    return None, f"Feature '{col}' contains NaN or infinite value."
                row_dict[col] = numeric_val
            except (ValueError, TypeError):
                return None, f"Feature '{col}' must be a valid number, got: {val}"

        df = pd.DataFrame([row_dict], columns=FEATURE_COLUMNS)
        return df, None

    def predict(
        self,
        features: Dict[str, Any],
        model_name: Optional[str] = None,
        threshold: float = DEFAULT_DECISION_THRESHOLD,
    ) -> Dict[str, Any]:
        """
        Runs model inference on input features:
        1. Validates inputs.
        2. Applies RobustScaler to Time and Amount.
        3. Generates probability and applies threshold.
        4. Categorizes risk level.
        """
        df_input, err = self.validate_features(features)
        if err:
            raise ValueError(err)

        model, actual_model_name = self.get_model(model_name)

        if self._scaler is None:
            self.load_artifacts()
            if self._scaler is None:
                raise RuntimeError("Feature scaler is not loaded. Run ml/preprocess.py first.")

        # Transform Time and Amount
        df_scaled = df_input.copy()
        df_scaled[["Time", "Amount"]] = self._scaler.transform(df_scaled[["Time", "Amount"]])

        # Predict probability
        if hasattr(model, "predict_proba"):
            proba = float(model.predict_proba(df_scaled)[0, 1])
        elif hasattr(model, "decision_function"):
            score = float(model.decision_function(df_scaled)[0])
            # Sigmoid approximation for decision function scores
            proba = float(1.0 / (1.0 + np.exp(-score)))
        else:
            proba = float(model.predict(df_scaled)[0])

        # Apply calibrated threshold
        pred_class = 1 if proba >= threshold else 0

        # Risk classification
        if proba < 0.20:
            risk_tier = "LOW"
            risk_label = "Legitimate"
        elif proba < 0.50:
            risk_tier = "MODERATE"
            risk_label = "Elevated Caution"
        elif proba < 0.80:
            risk_tier = "HIGH"
            risk_label = "High Fraud Risk"
        else:
            risk_tier = "CRITICAL"
            risk_label = "Confirmed Fraud Alert"

        raw_amount = float(features.get("Amount", 0.0))

        return {
            "predicted_class": pred_class,
            "prediction_label": "Fraudulent" if pred_class == 1 else "Legitimate",
            "risk_score": round(proba, 4),
            "risk_percentage": round(proba * 100, 2),
            "risk_tier": risk_tier,
            "risk_label": risk_label,
            "decision_threshold": float(threshold),
            "model_name": actual_model_name,
            "amount": raw_amount,
            "is_fraud_alert": pred_class == 1,
            "disclaimer": (
                "Academic Demonstration: This score represents algorithmic likelihood "
                "based on anonymized PCA features and does not constitute a real banking block."
            ),
        }

    def get_comparison(self) -> Dict[str, Any]:
        """Returns loaded model comparison metrics."""
        if self._comparison is None:
            self.load_artifacts()
        return self._comparison or {"status": "models_not_trained"}

    def get_schema(self) -> Dict[str, Any]:
        """Returns feature schema definition."""
        if self._schema is None:
            self.load_artifacts()
        return self._schema or {"status": "schema_not_available"}


# Singleton instance
model_service = ModelService()

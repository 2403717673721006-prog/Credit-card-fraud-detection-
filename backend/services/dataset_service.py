import os
import json
from pathlib import Path
from typing import Dict, Any, Optional, List
import pandas as pd

from backend.config import DATASET_PATH, ARTIFACTS_DIR, ML_DATA_DIR, ALL_COLUMNS, TARGET_COLUMN


class DatasetService:
    """Provides efficient paginated access to the dataset and validation summaries."""

    def __init__(self):
        self._df_cache: Optional[pd.DataFrame] = None
        self._summary_cache: Optional[Dict[str, Any]] = None

    def get_summary(self) -> Dict[str, Any]:
        """Loads and returns dataset validation metadata."""
        val_path = ML_DATA_DIR / "dataset_validation.json"
        if val_path.exists():
            try:
                with open(val_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                print(f"[DatasetService] Error reading validation summary: {e}")

        # Check if CSV exists even if JSON is missing
        if DATASET_PATH.exists():
            return {
                "status": "unvalidated",
                "file_path": str(DATASET_PATH),
                "file_size_mb": round(os.path.getsize(DATASET_PATH) / (1024 * 1024), 2),
                "message": "Dataset found. Run validation/preprocessing to inspect details.",
            }

        return {
            "status": "missing",
            "file_path": str(DATASET_PATH),
            "message": "Dataset not found. Follow setup guide to fetch creditcard.csv.",
        }

    def _get_dataframe(self) -> pd.DataFrame:
        """Loads dataset into memory cache for responsive pagination & search."""
        if self._df_cache is not None:
            return self._df_cache

        if not DATASET_PATH.exists():
            raise FileNotFoundError(f"Dataset not found at {DATASET_PATH}")

        # Read dataset
        df = pd.read_csv(DATASET_PATH)
        # Add index column for unique transaction reference
        df["transaction_id"] = [f"TX-{i:06d}" for i in range(len(df))]
        self._df_cache = df
        return self._df_cache

    def get_transactions(
        self,
        page: int = 1,
        per_page: int = 20,
        class_filter: Optional[int] = None,
        min_amount: Optional[float] = None,
        max_amount: Optional[float] = None,
        sort_by: str = "Time",
        sort_order: str = "desc",
        search: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Returns paginated, filtered transaction records."""
        try:
            df = self._get_dataframe()
        except FileNotFoundError as e:
            return {
                "items": [],
                "total": 0,
                "page": page,
                "per_page": per_page,
                "total_pages": 0,
                "error": str(e),
            }

        filtered = df

        # Filter by actual Class
        if class_filter is not None:
            filtered = filtered[filtered[TARGET_COLUMN] == int(class_filter)]

        # Filter by Amount range
        if min_amount is not None:
            filtered = filtered[filtered["Amount"] >= float(min_amount)]
        if max_amount is not None:
            filtered = filtered[filtered["Amount"] <= float(max_amount)]

        # Search by transaction ID or amount
        if search:
            search_str = str(search).strip()
            mask = filtered["transaction_id"].str.contains(search_str, case=False, na=False)
            try:
                search_num = float(search_str)
                mask = mask | (filtered["Amount"] == search_num)
            except ValueError:
                pass
            filtered = filtered[mask]

        # Sorting
        ascending = (sort_order.lower() == "asc")
        if sort_by in filtered.columns:
            filtered = filtered.sort_values(by=sort_by, ascending=ascending)

        total_count = len(filtered)
        per_page = max(1, min(100, per_page))
        total_pages = (total_count + per_page - 1) // per_page
        page = max(1, min(page, max(1, total_pages)))

        start_idx = (page - 1) * per_page
        end_idx = start_idx + per_page
        page_records = filtered.iloc[start_idx:end_idx]

        items = []
        for _, row in page_records.iterrows():
            row_dict = row.to_dict()
            tx_id = row_dict.pop("transaction_id")
            actual_class = int(row_dict.pop(TARGET_COLUMN))
            amount = float(row_dict["Amount"])
            tx_time = float(row_dict["Time"])

            # Provide summary row with selected top PCA components
            items.append({
                "transaction_id": tx_id,
                "time": tx_time,
                "amount": amount,
                "actual_class": actual_class,
                "actual_label": "Fraudulent" if actual_class == 1 else "Legitimate",
                "key_features": {
                    "V1": round(float(row_dict.get("V1", 0.0)), 4),
                    "V2": round(float(row_dict.get("V2", 0.0)), 4),
                    "V3": round(float(row_dict.get("V3", 0.0)), 4),
                    "V4": round(float(row_dict.get("V4", 0.0)), 4),
                    "V14": round(float(row_dict.get("V14", 0.0)), 4),
                    "V17": round(float(row_dict.get("V17", 0.0)), 4),
                },
                "all_features": {k: round(float(v), 5) for k, v in row_dict.items()},
            })

        return {
            "items": items,
            "total": total_count,
            "page": page,
            "per_page": per_page,
            "total_pages": total_pages,
        }

    def get_transaction_by_id(self, tx_id: str) -> Optional[Dict[str, Any]]:
        """Finds and returns a single transaction by ID."""
        try:
            df = self._get_dataframe()
        except FileNotFoundError:
            return None

        matched = df[df["transaction_id"] == tx_id]
        if matched.empty:
            return None

        row = matched.iloc[0].to_dict()
        tx_id = row.pop("transaction_id")
        actual_class = int(row.pop(TARGET_COLUMN))
        return {
            "transaction_id": tx_id,
            "time": float(row["Time"]),
            "amount": float(row["Amount"]),
            "actual_class": actual_class,
            "actual_label": "Fraudulent" if actual_class == 1 else "Legitimate",
            "features": {k: float(v) for k, v in row.items()},
        }


# Singleton instance
dataset_service = DatasetService()

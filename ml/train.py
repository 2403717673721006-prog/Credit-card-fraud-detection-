import os
import sys
import time
import json
from pathlib import Path
import pandas as pd
import numpy as np
import joblib

from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
    confusion_matrix,
    precision_recall_curve,
    roc_curve,
)

# Add project root to sys.path
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from backend.config import (
    DATASET_PATH,
    ML_DIR,
    ARTIFACTS_DIR as BACKEND_ARTIFACTS_DIR,
    FEATURE_COLUMNS,
    TARGET_COLUMN,
)
from ml.preprocess import preprocess_data

ML_ARTIFACTS_DIR = ML_DIR / "artifacts"
ML_ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
BACKEND_ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)


def train_models():
    """
    Trains and evaluates 4 classification algorithms on credit card fraud detection:
    1. Logistic Regression (class_weight='balanced')
    2. Decision Tree Classifier (class_weight='balanced')
    3. Random Forest Classifier (n_estimators=100, class_weight='balanced')
    4. K-Nearest Neighbors Classifier (trained on stratified resampled partition)
    """
    print("=" * 70)
    print("CREDITGUARD ML MODEL TRAINING PIPELINE")
    print("=" * 70)

    # 1. Preprocessing & Stratified Train/Test Split
    X_train, X_test, y_train, y_test, scaler = preprocess_data()

    print(f"\n[Training] X_train shape: {X_train.shape}, X_test shape: {X_test.shape}")
    print(f"[Training] Test fraud cases: {int(sum(y_test == 1))}, Test legitimate cases: {int(sum(y_test == 0))}")

    # Prepare KNN training set:
    # KNN distance matrix over 227k samples is computationally prohibitive and susceptible to majority class drowning.
    # We use all 394 training fraud cases + a stratified 1:5 ratio of legitimate cases (1,970 cases) for KNN.
    fraud_mask = (y_train == 1)
    legit_indices = y_train[~fraud_mask].sample(n=394 * 5, random_state=42).index
    knn_train_indices = list(y_train[fraud_mask].index) + list(legit_indices)
    X_train_knn = X_train.loc[knn_train_indices]
    y_train_knn = y_train.loc[knn_train_indices]

    # Models definition
    models = {
        "Logistic Regression": {
            "model": LogisticRegression(class_weight="balanced", max_iter=1000, random_state=42, solver="lbfgs"),
            "X_tr": X_train,
            "y_tr": y_train,
            "description": "Linear classifier with L2 regularization and inverse class frequency weighting.",
        },
        "Decision Tree": {
            "model": DecisionTreeClassifier(class_weight="balanced", max_depth=7, min_samples_split=20, min_samples_leaf=10, random_state=42),
            "X_tr": X_train,
            "y_tr": y_train,
            "description": "Rule-based partition tree optimized with max depth 7 to limit overfitting on noise.",
        },
        "Random Forest": {
            "model": RandomForestClassifier(n_estimators=100, max_depth=10, class_weight="balanced", min_samples_leaf=4, n_jobs=-1, random_state=42),
            "X_tr": X_train,
            "y_tr": y_train,
            "description": "Ensemble of 100 decorrelated decision trees with balanced bootstrap aggregation.",
        },
        "K-Nearest Neighbors": {
            "model": KNeighborsClassifier(n_neighbors=5, weights="distance", n_jobs=-1),
            "X_tr": X_train_knn,
            "y_tr": y_train_knn,
            "description": "Instance-based non-parametric classifier with inverse-distance weighting.",
        },
    }

    results = {}
    curves_data = {}

    for name, config in models.items():
        print(f"\n[Training] Training: {name}...")
        clf = config["model"]
        t_start = time.time()
        clf.fit(config["X_tr"], config["y_tr"])
        train_time = round(time.time() - t_start, 3)
        print(f"[Training] {name} trained in {train_time}s. Evaluating on test set ({len(X_test):,} samples)...")

        # Predictions
        t_eval_start = time.time()
        y_pred = clf.predict(X_test)
        if hasattr(clf, "predict_proba"):
            y_prob = clf.predict_proba(X_test)[:, 1]
        elif hasattr(clf, "decision_function"):
            scores = clf.decision_function(X_test)
            y_prob = (scores - scores.min()) / (scores.max() - scores.min())
        else:
            y_prob = y_pred.astype(float)
        eval_time = round(time.time() - t_eval_start, 3)

        # Metrics computation
        acc = float(accuracy_score(y_test, y_pred))
        prec = float(precision_score(y_test, y_pred, zero_division=0))
        rec = float(recall_score(y_test, y_pred, zero_division=0))
        f1 = float(f1_score(y_test, y_pred, zero_division=0))
        roc_auc = float(roc_auc_score(y_test, y_prob))
        avg_prec = float(average_precision_score(y_test, y_prob))
        cm = confusion_matrix(y_test, y_pred).tolist()
        tn, fp, fn, tp = int(cm[0][0]), int(cm[0][1]), int(cm[1][0]), int(cm[1][1])

        print(f"  Accuracy          : {acc * 100:.2f}%")
        print(f"  Precision         : {prec * 100:.2f}%")
        print(f"  Recall            : {rec * 100:.2f}% ({tp}/{tp+fn} frauds caught)")
        print(f"  F1-Score          : {f1:.4f}")
        print(f"  Average Precision : {avg_prec:.4f}")
        print(f"  ROC-AUC           : {roc_auc:.4f}")
        print(f"  Confusion Matrix  : TN={tn:,}, FP={fp:,}, FN={fn:,}, TP={tp:,}")

        # Precision-Recall curve points for frontend charts (subsampled to 40 points)
        precision_pts, recall_pts, thresholds = precision_recall_curve(y_test, y_prob)
        step = max(1, len(precision_pts) // 40)
        pr_curve_sample = [
            {"recall": round(float(r), 4), "precision": round(float(p), 4)}
            for r, p in zip(recall_pts[::step], precision_pts[::step])
        ]

        # ROC curve points
        fpr_pts, tpr_pts, _ = roc_curve(y_test, y_prob)
        roc_step = max(1, len(fpr_pts) // 40)
        roc_curve_sample = [
            {"fpr": round(float(f), 4), "tpr": round(float(t), 4)}
            for f, t in zip(fpr_pts[::roc_step], tpr_pts[::roc_step])
        ]

        # Save model joblib artifact
        model_filename = f"{name.lower().replace(' ', '_').replace('-', '_')}.joblib"
        joblib.dump(clf, ML_ARTIFACTS_DIR / model_filename)
        joblib.dump(clf, BACKEND_ARTIFACTS_DIR / model_filename)

        results[name] = {
            "name": name,
            "filename": model_filename,
            "description": config["description"],
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4),
            "average_precision": round(avg_prec, 4),
            "roc_auc": round(roc_auc, 4),
            "confusion_matrix": cm,
            "tn": tn,
            "fp": fp,
            "fn": fn,
            "tp": tp,
            "training_time_seconds": train_time,
            "evaluation_time_seconds": eval_time,
            "test_total": len(y_test),
            "test_fraud_actual": tp + fn,
            "test_legit_actual": tn + fp,
            "pr_curve": pr_curve_sample,
            "roc_curve": roc_curve_sample,
        }

    # Model Selection: Rank by Average Precision (PR-AUC) and F1 Score
    # For extreme imbalance (0.17%), Average Precision is the gold-standard metric.
    selected_name = max(results.keys(), key=lambda k: results[k]["average_precision"])
    selected_info = results[selected_name]

    print("\n" + "=" * 70)
    print(f"MODEL SELECTION DECISION: {selected_name}")
    print(f"Selection Metric: Average Precision (PR-AUC) = {selected_info['average_precision']:.4f}")
    print(f"F1-Score: {selected_info['f1_score']:.4f} | Recall: {selected_info['recall']*100:.1f}% | Precision: {selected_info['precision']*100:.1f}%")
    print("=" * 70)

    # Save selected model alias
    selected_model_obj = models[selected_name]["model"]
    joblib.dump(selected_model_obj, ML_ARTIFACTS_DIR / "selected_model.joblib")
    joblib.dump(selected_model_obj, BACKEND_ARTIFACTS_DIR / "selected_model.joblib")

    # Save summary metadata JSON
    comparison_summary = {
        "selected_model": selected_name,
        "selection_metric": "Average Precision (PR-AUC)",
        "selection_rationale": (
            "Because fraud represents only ~0.17% of transactions, raw Accuracy is deeply deceptive (a naive model predicting all zeros achieves 99.83% accuracy). "
            "Average Precision summarizes the Area Under the Precision-Recall curve, directly penalizing both false alarms and missed fraud. "
            f"{selected_name} achieved the superior trade-off between detecting high fraud volume and minimizing customer friction."
        ),
        "models": results,
    }

    with open(ML_ARTIFACTS_DIR / "model_comparison.json", "w", encoding="utf-8") as f:
        json.dump(comparison_summary, f, indent=2)
    with open(BACKEND_ARTIFACTS_DIR / "model_comparison.json", "w", encoding="utf-8") as f:
        json.dump(comparison_summary, f, indent=2)

    print(f"\n[Training] Model artifacts and comparison JSON successfully written to backend and ml artifacts.")
    return comparison_summary


if __name__ == "__main__":
    train_models()

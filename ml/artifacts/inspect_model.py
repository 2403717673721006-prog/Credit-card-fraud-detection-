import sys
from pathlib import Path
import joblib
from sklearn.utils.validation import check_is_fitted
from sklearn.exceptions import NotFittedError

# 1. Dynamically locate project root (directory containing ml, backend, frontend)
current_path = Path(__file__).resolve().parent
project_root = None

for parent in [current_path] + list(current_path.parents):
    if (parent / "ml").exists() and (parent / "backend").exists() and (parent / "frontend").exists():
        project_root = parent
        break

if project_root is None:
    # Fallback: inspect_model.py is at ml/artifacts/inspect_model.py (2 levels up to root)
    project_root = current_path.parent.parent

# 2. Locate model path relative to project root
model_path = project_root / "ml" / "artifacts" / "k_nearest_neighbors.joblib"

# Fallback: check adjacent directory if located right next to the script
if not model_path.exists():
    adjacent_path = current_path / "k_nearest_neighbors.joblib"
    if adjacent_path.exists():
        model_path = adjacent_path

print("=" * 65)
print("CREDITGUARD ML ARTIFACT INSPECTOR")
print("=" * 65)
print(f"Project Root     : {project_root}")
print(f"Target Model Path: {model_path}")

if not model_path.exists():
    print(f"\n[Error] Model artifact not found at: {model_path}")
    print("Please run 'python ml/train.py' to generate trained model artifacts.")
    sys.exit(1)

# 3. Load model artifact
try:
    model = joblib.load(model_path)
    print(f"Load Status      : Successfully loaded from disk")
except Exception as e:
    print(f"\n[Error] Failed to load model artifact: {e}")
    sys.exit(1)

print("-" * 65)

# 4. Model Class & Type
print(f"Model Class      : {model.__class__.__name__}")
print(f"Full Type        : {type(model)}")
print(f"Module           : {model.__class__.__module__}")

# 5. Core Hyperparameters
if hasattr(model, "n_neighbors"):
    print(f"Neighbors (K)    : {model.n_neighbors}")
if hasattr(model, "weights"):
    print(f"Weights Function : '{model.weights}' (closer neighbors have higher voting weight)")
if hasattr(model, "metric"):
    print(f"Distance Metric  : '{model.metric}' (p={getattr(model, 'p', 2)} -> Euclidean distance)")
if hasattr(model, "algorithm"):
    print(f"Search Algorithm : '{model.algorithm}'")

# 6. Training & Input Dimensions
if hasattr(model, "n_features_in_"):
    print(f"Input Features   : {model.n_features_in_} features expected")

if hasattr(model, "n_samples_fit_"):
    print(f"Fitted Samples   : {model.n_samples_fit_:,} transactions stored in KNN index")

if hasattr(model, "classes_"):
    print(f"Class Labels     : {list(model.classes_)} (0 = Legitimate, 1 = Fraudulent)")

# 7. Safe Fitted Status Check
try:
    check_is_fitted(model)
    is_fitted = True
except NotFittedError:
    is_fitted = False
except Exception:
    # Fallback check using internal attributes
    is_fitted = hasattr(model, "_fit_method") or hasattr(model, "classes_")

print(f"Is Fitted        : {'Yes (Trained & ready for inference)' if is_fitted else 'No (Not fitted)'}")

# 8. Complete Parameter Dictionary
print("-" * 65)
print("Configured Parameters (get_params):")
for param_name, param_val in model.get_params().items():
    print(f"  - {param_name:18}: {param_val}")
print("=" * 65)

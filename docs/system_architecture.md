# Component B: User Interface & Backend Connectivity (5 Marks)
**Course:** 22MDC56 Machine Learning Laboratory  
**Project:** CreditGuard — Real-Time Fraud Monitoring & Credit Card Fraud Detection System

---

## 1. System Architecture Overview
CreditGuard is constructed upon a high-performance decoupled architecture separating presentation logic, asynchronous inference routing, machine learning serialization, and persistent prediction auditing.

```
                      +---------------------------------------+
                      |       React 18 + Vite Frontend        |
                      |  (Tailwind CSS, Lucide, Recharts)     |
                      +---------------------------------------+
                                          |
                         REST API Requests (HTTP / JSON)
                                          |
                                          v
                      +---------------------------------------+
                      |         Flask Backend Engine          |
                      |    (CORS, Threading, App Factory)     |
                      +---------------------------------------+
                           |              |              |
           +---------------+              |              +---------------+
           v                              v                              v
+--------------------+         +--------------------+         +--------------------+
|  Dataset Service   |         |   Model Service    |         | Monitoring Engine  |
|  (284k Pagination, |         |  (Cached Joblib,   |         |  (Thread-Safe Ring |
|  Filtering & Search|         |  RobustScaler,     |         |  Buffer Simulator) |
|  from CSV Storage) |         |  Threshold Tuning) |         |                    |
+--------------------+         +--------------------+         +--------------------+
                                          |                              |
                                          v                              v
                               +--------------------+         +--------------------+
                               | ML Model Artifacts |         | SQLite Audit Store |
                               | (RF, LR, DT, KNN,  |         | (creditguard.db    |
                               |  Scaler, Schemas)  |         |  Predictions Log)  |
                               +--------------------+         +--------------------+
```

---

## 2. Frontend Architecture
- **Framework:** React 18 with Vite bundling and TypeScript.
- **Styling Paradigm:** Vanilla Tailwind CSS with custom financial dark theme tokens (`#080d1a` background, electric cyan `#06b6d4`, alert rose `#ef4444`, legit emerald `#10b981`).
- **Data Visualization:** Recharts responsive SVG primitives (Donut charts, comparative bar graphs, PR curve approximations).
- **Navigation Routing:** React Router v6 with 8 distinct views:
  1. `/` — Real-Time Fraud Monitoring Dashboard
  2. `/transactions` — Historical Transaction Monitoring (284k Records)
  3. `/predict` — Interactive Fraud Prediction Tool
  4. `/dataset` — Dataset Architecture & Schema Overview
  5. `/eda` — Exploratory Data Analysis & Empirical Findings
  6. `/evaluation` — Machine Learning Model Evaluation Matrix
  7. `/insights` — Empirical Business Insights & Institutional Trade-offs
  8. `/about` — Course Metadata & Technical Documentation

---

## 3. Backend REST API Architecture
The backend is built using Python 3.14 and Flask, organized via modular blueprints:

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | `GET` | System heartbeat, model readiness, and dataset availability flags. |
| `/api/dataset/summary` | `GET` | Validated row counts, class distribution, nulls, duplicates, amount stats. |
| `/api/dataset/transactions` | `GET` | Paginated (10/20/50), filterable, and searchable records from 284k CSV. |
| `/api/dataset/transactions/<id>` | `GET` | Complete 30-feature vector inspection for a specific transaction ID. |
| `/api/eda/summary` | `GET` | Statistical quantiles, amount brackets, and Pearson correlation coefficients. |
| `/api/eda/plots/<filename>` | `GET` | Serves high-resolution Matplotlib/Seaborn diagnostic plots. |
| `/api/models/comparison` | `GET` | Cross-algorithm evaluation metrics (Accuracy, Precision, Recall, F1, PR-AUC). |
| `/api/models/schema` | `GET` | Expected feature schema and transformation requirements. |
| `/api/predict` | `POST` | Real-time transaction inference with model selection and threshold tuning. |
| `/api/predictions/history` | `GET` | Persistent chronological prediction audit trail retrieved from SQLite. |
| `/api/monitoring/status` | `GET` | Real-time sliding window snapshot, processed counters, and alert queues. |
| `/api/monitoring/start` | `POST` | Starts or resumes transaction simulation stream without duplicate threads. |
| `/api/monitoring/pause` | `POST` | Pauses streaming without clearing metric accumulators. |
| `/api/monitoring/resume` | `POST` | Resumes transaction stream processing. |
| `/api/monitoring/reset` | `POST` | Terminates worker thread and resets accumulators to zero. |

---

## 4. Request-Response Flow & State Management
1. **Prediction Inference Flow:**
   ```
   Client POST /api/predict { features: {...}, model_name: "Random Forest", threshold: 0.5 }
     -> Flask Route: Validates feature schema completeness and numeric types.
     -> ModelService: Normalizes model name, fetches cached Joblib instance.
     -> RobustScaler: Applies fitted scale transforms to Time and Amount.
     -> Inference: model.predict_proba() computes continuous posterior probability.
     -> Threshold Calibration: predicted_class = 1 if risk_score >= threshold else 0.
     -> SQLite Store: Asynchronously logs record into creditguard.sqlite3.
     -> Returns: 200 OK with prediction_id, risk_score, risk_tier, and disclaimer.
   ```

2. **Real-Time Simulation Flow:**
   - Managed via a thread-safe singleton `MonitoringService` utilizing Python `threading.Lock` and bounded deques (`maxlen=100` for transactions, `maxlen=30` for alerts).
   - Prevents thread duplication: Calling `/api/monitoring/start` multiple times validates existing thread status before launching new workers.
   - Frontend polls `/api/monitoring/status` at controlled intervals (1.2 seconds), avoiding socket connection leakages while maintaining sub-second UI updates.

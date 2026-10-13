# Component F: Deployment, Configuration & Demonstration Guide (5 Marks)
**Course:** 22MDC56 Machine Learning Laboratory  
**Project:** CreditGuard — Real-Time Fraud Monitoring & Credit Card Fraud Detection System

---

## 1. Deployment Architecture
CreditGuard is designed for modular, decoupled deployment across modern containerized or cloud environments (e.g. Render, Railway, AWS EC2, or local bare-metal laboratory machines):

- **Frontend Container / Static Host:**
  - Build output: `frontend/dist/` (static HTML/CSS/JS).
  - Can be served via Nginx, Vercel, Netlify, or Vite preview.
- **Backend Service:**
  - Python Flask application served via a production WSGI server (`waitress` for Windows or `gunicorn` for Linux).
  - Port: 5000 (default) with CORS configured to accept the frontend domain.
- **Persistence:**
  - SQLite file (`creditguard.sqlite3`) for prediction history logs.
  - Joblib serialized model artifacts stored in `backend/artifacts/`.

---

## 2. Environment Configuration
Create a `.env` file in the root directory (based on `.env.example`):

```bash
# Backend Configuration
FLASK_ENV=development
FLASK_DEBUG=1
BACKEND_HOST=127.0.0.1
BACKEND_PORT=5000
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Dataset Path
DATASET_PATH=ml/data/creditcard.csv

# Frontend Configuration (in frontend/.env)
VITE_API_BASE_URL=http://127.0.0.1:5000/api
```

---

## 3. Step-by-Step Local Startup Instructions

### Step 1: Install Dependencies
```bash
# 1. Install Backend Python Dependencies
pip install -r backend/requirements.txt

# 2. Install Frontend Node Packages
cd frontend
npm install
cd ..
```

### Step 2: Fetch Dataset and Execute Preprocessing & Training
```bash
# Download Kaggle dataset and validate
python ml/fetch_dataset.py

# Run leak-free preprocessing and Exploratory Data Analysis
python ml/preprocess.py
python ml/eda.py

# Train and benchmark all 4 machine learning models
python ml/train.py

# Generate comparative evaluation figures
python ml/evaluate.py
```

### Step 3: Run Automated Test Suite
```bash
python -m pytest backend/tests/test_creditguard.py -v
```

### Step 4: Start Backend Server
```bash
# Terminal 1: Launch Flask API Server
python backend/app.py
```
*Health Check Verification:* Open `http://127.0.0.1:5000/api/health` in your browser.

### Step 5: Start Frontend Application
```bash
# Terminal 2: Launch Vite React Application
cd frontend
npm run dev
```
*Dashboard Access:* Open `http://127.0.0.1:5173/` in your browser.

---

## 4. Production WSGI Deployment Commands

### On Windows (Using Waitress):
```bash
pip install waitress
waitress-serve --listen=127.0.0.1:5000 backend.app:app
```

### On Linux / Docker (Using Gunicorn):
```bash
pip install gunicorn
gunicorn --bind 0.0.0.0:5000 --workers 4 --threads 2 backend.app:app
```

---

## 5. Live Demonstration Workflow (Examiner Walkthrough)

1. **Step 1: Dashboard Inspection (`/`)**
   - Point out the active model badge (`Random Forest`, `PR-AUC 0.844`) and course header `22MDC56`.
   - Click **"Start Stream"** to begin real-time monitoring simulation.
   - Observe incoming transactions, live volume donut chart, and intercepted fraud alerts.
2. **Step 2: Transaction Monitoring (`/transactions`)**
   - Demonstrate pagination through the 284,807 transactions.
   - Filter by **"Fraudulent Only (Class 1)"** to inspect genuine fraud rows.
   - Click **"Inspect"** on a fraud transaction to view all 30 PCA features.
   - Click **"Run in Live Fraud Predictor"** to send this transaction to the prediction engine.
3. **Step 3: Fraud Prediction Tool (`/predict`)**
   - Click **"Fill Known Fraud Vector"**, observe auto-population of V1-V28 coordinates.
   - Click **"Evaluate Fraud Likelihood"**, review the high risk score (>95%) and critical tier badge.
   - Demonstrate the **Classification Threshold Slider** (adjust from 50% to 70% and re-test).
4. **Step 4: Exploratory Data Analysis (`/eda`)**
   - Review the empirical findings: 577:1 imbalance, amount skew, and top feature correlations (V14, V12 negative; V4, V11 positive).
5. **Step 5: Model Evaluation Matrix (`/evaluation`)**
   - Review the 4-algorithm benchmark table.
   - Explain the **Accuracy Paradox** (Logistic Regression's 97.55% accuracy vs 1,388 false alarms vs Random Forest's 24 false alarms).
   - Click different model rows to update the interactive confusion matrix.
6. **Step 6: Business Insights (`/insights`)**
   - Present evidence-based recommendations on tiered routing and dynamic thresholding.

---

## 6. GitHub Repository Setup Guidelines
- The `.gitignore` is pre-configured to exclude:
  - Raw large datasets (`ml/data/*.csv`, `*.zip`)
  - Virtual environments (`.venv`, `env/`)
  - Node modules (`frontend/node_modules/`)
  - Temporary cache directories (`.pytest_cache`, `__pycache__`)
- Commit only application code, configuration files, documentation, and small serialized artifacts.

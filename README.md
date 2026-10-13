# CreditGuard — Real-Time Fraud Monitoring & Credit Card Fraud Detection System

[![Course](https://img.shields.io/badge/Course-22MDC56%20ML%20Lab-06b6d4.svg)](#)
[![Python](https://img.shields.io/badge/Python-3.14-3776AB.svg?logo=python&logoColor=white)](#)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20TypeScript-61DAFB.svg?logo=react&logoColor=black)](#)
[![Scikit-Learn](https://img.shields.io/badge/ML-Scikit--Learn-F7931E.svg?logo=scikitlearn&logoColor=white)](#)
[![Tests](https://img.shields.io/badge/Tests-9%20Passed-10b981.svg)](#)
[![Vite](https://img.shields.io/badge/Bundler-Vite%208-646CFF.svg?logo=vite&logoColor=white)](#)

> **22MDC56 Machine Learning Laboratory Course Project (Full 40-Mark Rubric)**  
> An end-to-end applied machine learning system addressing extreme class imbalance (577:1), evaluating 4 classification algorithms on 284,807 transactions, serving real-time REST inference APIs, and simulating an interactive transaction monitoring dashboard.

---

## 📑 Table of Contents
1. [Key Features](#-key-features)
2. [Evaluation Rubric Mapping (40 Marks)](#-evaluation-rubric-mapping-40-marks)
3. [Empirical Model Benchmark Results](#-empirical-model-benchmark-results)
4. [Architecture & System Flow](#-architecture--system-flow)
5. [Repository Structure](#-repository-structure)
6. [Quick Start Guide](#-quick-start-guide)
7. [Running Tests](#-running-tests)
8. [The 8 Application Pages](#-the-8-application-pages)
9. [Academic Disclaimer](#-academic-disclaimer)

---

## 🌟 Key Features
- **Rigorous Data Preprocessing:** Leak-free stratified splitting and outlier scaling using `RobustScaler` on transaction `Time` and `Amount`.
- **4 Machine Learning Classifiers:** Benchmarked Logistic Regression, Decision Tree, Random Forest, and K-Nearest Neighbors.
- **Champion Model Selection:** Random Forest selected via Average Precision (**PR-AUC 0.8444**) and **F1-Score (0.8039)**, reducing false alarms by 98.3%.
- **Real-Time Monitoring Simulator:** Thread-safe background stream processing incoming transactions with live counters, alerts, and pause/resume controls.
- **Interactive Fraud Predictor:** Dynamic form with numeric validation, model selector, threshold slider (0.1 to 0.9), and preset vectors.
- **Persistent SQLite Audit Trail:** Logs inference events into `creditguard.sqlite3` with separation between predictions and ground-truth labels.
- **Sophisticated Financial Dark Theme:** Deep navy `#080d1a`, cyan `#06b6d4`, alert rose `#ef4444`, and legit emerald `#10b981`.

---

## 📊 Empirical Model Benchmark Results
Evaluated on **56,962 untouched test transactions** (Stratified 20% split: 56,864 Legitimate, 98 Fraud):

| Model | Accuracy | Precision | Recall | F1-Score | PR-AUC (Avg Prec) | ROC-AUC | False Positives | False Negatives |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Logistic Regression** | 97.55% | 6.09% | **91.84%** | 0.1142 | 0.7175 | 0.9720 | 1,388 | **8** |
| **Decision Tree** | 97.62% | 5.76% | 83.67% | 0.1078 | 0.4615 | 0.8778 | 1,342 | 16 |
| **Random Forest (Champion)** | **99.93%** | **77.36%** | 83.67% | **0.8039** | **0.8444** | **0.9785** | **24** | 16 |
| **K-Nearest Neighbors** | 99.44% | 22.36% | 90.82% | 0.3589 | 0.4794 | 0.9602 | 309 | 9 |

> **Key Takeaway (The Accuracy Paradox):** Logistic Regression achieves 97.55% accuracy but produces **1,388 false alarms** (6.09% precision). Random Forest reduces false alarms down to just **24** while catching **82 out of 98 fraud attacks** (83.67% recall).

---

## 🎯 Evaluation Rubric Mapping (40 Marks)

| Component | Marks | Coverage & Artifacts |
| :--- | :--- | :--- |
| **A. Problem Identification & Literature Survey** | 5 Marks | [docs/problem_statement.md](file:///c:/Users/arish/Desktop/ml%20project/docs/problem_statement.md) — 577:1 imbalance problem, survey of Dal Pozzolo et al., research gap. |
| **B. UI & Backend Connectivity** | 5 Marks | [docs/system_architecture.md](file:///c:/Users/arish/Desktop/ml%20project/docs/system_architecture.md) — React 18 frontend, Flask REST APIs, request flow, and state. |
| **C. Preprocessing & EDA** | 5 Marks | [docs/methodology.md](file:///c:/Users/arish/Desktop/ml%20project/docs/methodology.md) & [ml/eda.py](file:///c:/Users/arish/Desktop/ml%20project/ml/eda.py) — RobustScaler, 0 nulls audit, 1,081 duplicates, correlation analysis. |
| **D. Model Building** | 5 Marks | [ml/train.py](file:///c:/Users/arish/Desktop/ml%20project/ml/train.py) — All 4 algorithms trained, class weighting, KNN under-sampling, serialization to joblib. |
| **E. Result Analysis & Business Insights** | 5 Marks | [docs/final_report.md](file:///c:/Users/arish/Desktop/ml%20project/docs/final_report.md) — Error analysis (16 missed frauds), threshold tuning, tiered review. |
| **F. Deployment & Demo** | 5 Marks | [docs/deployment.md](file:///c:/Users/arish/Desktop/ml%20project/docs/deployment.md) — Environment variables, WSGI commands, step-by-step viva demo script. |
| **G. Presentation & Viva** | 5 Marks | [docs/viva_questions.md](file:///c:/Users/arish/Desktop/ml%20project/docs/viva_questions.md) — 10-slide deck outline, core definitions, and **25 viva questions & answers**. |
| **H. Report & GitHub** | 5 Marks | [docs/final_report.md](file:///c:/Users/arish/Desktop/ml%20project/docs/final_report.md) — Final academic report outline, citations, and repository documentation. |

---

## 📁 Repository Structure
```
CreditGuard/
├── backend/
│   ├── app.py                      # Flask Application Factory & Blueprints
│   ├── config.py                   # Central paths, schema, and environment settings
│   ├── requirements.txt            # Python dependencies
│   ├── creditguard.sqlite3         # SQLite database for prediction history
│   ├── artifacts/                  # Serialized Joblib models, scaler, metrics JSON
│   ├── models/
│   │   └── database.py             # SQLite prediction logging & queries
│   ├── routes/
│   │   ├── health.py               # GET /api/health
│   │   ├── dataset.py              # GET /api/dataset/summary & transactions
│   │   ├── eda.py                  # GET /api/eda/summary & plots
│   │   ├── models.py               # GET /api/models/comparison & schema
│   │   ├── predict.py              # POST /api/predict & GET /api/predictions/history
│   │   └── monitoring.py           # Real-time simulation controls (start/pause/reset)
│   ├── services/
│   │   ├── model_service.py        # In-memory cached inference & thresholding
│   │   ├── dataset_service.py      # 284k dataset caching & pagination
│   │   └── monitoring_service.py   # Thread-safe simulation stream engine
│   └── tests/
│       └── test_creditguard.py     # 9 Comprehensive Pytest verification tests
├── frontend/
│   ├── index.html                  # HTML entry with Google Fonts (Inter, JetBrains Mono)
│   ├── package.json                # React, Vite, Tailwind, Recharts, Lucide dependencies
│   ├── vite.config.ts              # Vite configuration
│   ├── tailwind.config.js          # Dark financial color tokens
│   └── src/
│       ├── App.tsx                 # React Router (8 views)
│       ├── types/index.ts          # Typed TypeScript interfaces
│       ├── services/api.ts         # Centralized REST API client
│       ├── layouts/                # Navbar, Sidebar, MainLayout
│       ├── components/             # MetricCard, RiskBadge, TransactionDetailModal
│       └── pages/                  # All 8 requested views
├── ml/
│   ├── fetch_dataset.py            # Kaggle dataset acquisition & schema validation
│   ├── preprocess.py               # Stratified 80/20 split & RobustScaler
│   ├── eda.py                      # Exploratory data analysis & dark-theme plot generator
│   ├── train.py                    # Multi-model training, evaluation & joblib export
│   ├── evaluate.py                 # Comparative charts & confusion matrix visualizer
│   └── data/                       # creditcard.csv storage (gitignored)
├── docs/                           # Rubric documentation (Components A through H)
│   ├── problem_statement.md
│   ├── system_architecture.md
│   ├── methodology.md
│   ├── deployment.md
│   ├── testing.md
│   ├── viva_questions.md
│   └── final_report.md
├── .env.example                    # Environment variable template
├── .gitignore                      # Large datasets, venv, and cache exclusions
└── README.md                       # Master project documentation
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### 2. Setup Environment & Dependencies
```bash
# Clone the repository
git clone <repo-url>
cd "ml project"

# Install backend dependencies
pip install -r backend/requirements.txt

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Dataset Acquisition, Preprocessing & Model Training
```bash
# 1. Fetch and validate Kaggle creditcard.csv
python ml/fetch_dataset.py

# 2. Run leak-free preprocessing and EDA
python ml/preprocess.py
python ml/eda.py

# 3. Train all 4 classifiers and export model artifacts
python ml/train.py

# 4. Generate evaluation visualization plots
python ml/evaluate.py
```

### 4. Run Automated Tests
```bash
python -m pytest backend/tests/test_creditguard.py -v
```
*(All 9 tests should pass).*

### 5. Launch Application
In **Terminal 1** (Backend):
```bash
python backend/app.py
```
*Backend runs at `http://127.0.0.1:5000` (Healthcheck: `http://127.0.0.1:5000/api/health`).*

In **Terminal 2** (Frontend):
```bash
cd frontend
npm run dev
```
*Open `http://127.0.0.1:5173/` in your browser.*

---

## 🧪 Running Tests
CreditGuard includes automated tests covering dataset schema, preprocessing, model loading, prediction API (valid and invalid payloads), and simulation lifecycle controls:
```bash
python -m pytest backend/tests/test_creditguard.py -v
```

---

## 🖥️ The 8 Application Pages
1. **Dashboard (`/`):** Real-time fraud monitoring dashboard with simulation controls (Start, Pause, Resume, Reset), incoming transaction feed, live counters, and volume donut chart.
2. **Transaction Monitoring (`/transactions`):** Full table of 284,807 transactions with pagination, sorting, class filtering (Legitimate vs Fraud), and 30-feature inspection drawer.
3. **Fraud Prediction Tool (`/predict`):** Interactive feature vector input with model selection dropdown, threshold slider (0.10 - 0.90), sample preset fillers, and inference risk meter.
4. **Dataset Overview (`/dataset`):** Summary metrics (284k rows, 30 inputs, 0 nulls, 1,081 duplicates, 577:1 imbalance), amount statistics, and schema catalog table.
5. **Exploratory Data Analysis (`/eda`):** Interactive Recharts and high-resolution plots for class imbalance, amount distribution brackets, and Pearson correlation coefficients (V14, V12, V10 vs V4, V11, V2).
6. **Model Evaluation (`/evaluation`):** 4-algorithm benchmark matrix, model selection justification (Random Forest PR-AUC 0.8444), accuracy paradox explanation, and interactive 2x2 confusion matrix heatmaps.
7. **Business Insights (`/insights`):** Evidence-based institutional findings on fraud loss vs customer friction, error analysis on the 16 missed fraud cases, and production architecture recommendations.
8. **Project Information (`/about`):** 22MDC56 syllabus metadata, problem statement, 4-phase methodology pipeline, technology stack, and academic disclaimer.

---

## ⚖️ Academic Disclaimer
CreditGuard is an academic research and laboratory project developed for the **22MDC56 Machine Learning Laboratory** course. It operates on an anonymized historical benchmark dataset and is not connected to a live banking authorization network.

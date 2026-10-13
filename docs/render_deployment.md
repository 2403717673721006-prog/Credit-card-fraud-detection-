# CreditGuard — Render Cloud Deployment Guide

This guide walks you step-by-step through deploying the **CreditGuard Real-Time Fraud Detection System** to [Render](https://render.com) (free tier supported).

---

## 🎯 Deployment Overview

- **Repository:** `https://github.com/2403717673721006-prog/Credit-card-fraud-detection-`
- **WSGI Engine:** Gunicorn (`gunicorn backend.app:app`)
- **Frontend Engine:** React 18 + Vite (compiled to `frontend/dist` and served statically by Flask with SPA route fallback)
- **Model Artifacts:** Serialized Scikit-Learn models (`selected_model.joblib`, `scaler.joblib`, etc.) pre-packaged in `backend/artifacts/`

---

## 🚀 Option 1: 1-Click Blueprint Deployment (Fastest)

CreditGuard includes a pre-configured `render.yaml` blueprint.

1. Log into your [Render Dashboard](https://dashboard.render.com/).
2. In the top navigation, click **"New +"** and select **"Blueprint"**.
3. Connect your GitHub account and select the repository:  
   `2403717673721006-prog/Credit-card-fraud-detection-`
4. Render will automatically detect `render.yaml` and configure:
   - **Service Name:** `creditguard`
   - **Environment:** `Python`
   - **Build Command:** `pip install -r backend/requirements.txt && cd frontend && npm install && npm run build && cd ..`
   - **Start Command:** `gunicorn backend.app:app`
5. Click **"Apply"**.
6. Render will build the React bundle, install Python packages, and deploy your live URL (e.g., `https://creditguard.onrender.com`).

---

## 🛠️ Option 2: Manual Web Service Deployment

If you prefer to configure the Web Service manually via Render's UI:

1. Go to [Render Dashboard](https://dashboard.render.com/) -> Click **"New +"** -> **"Web Service"**.
2. Select **"Build and deploy from a Git repository"** and choose:  
   `2403717673721006-prog/Credit-card-fraud-detection-`
3. Fill in the following settings:
   - **Name:** `creditguard` (or any custom name)
   - **Region:** Choose the region closest to you (e.g., `Oregon (US West)` or `Singapore`)
   - **Branch:** `main`
   - **Root Directory:** Leave blank (root directory)
   - **Runtime:** `Python 3`
   - **Build Command:**
     ```bash
     pip install -r backend/requirements.txt && cd frontend && npm install && npm run build && cd ..
     ```
   - **Start Command:**
     ```bash
     gunicorn backend.app:app
     ```
   - **Instance Type:** `Free` ($0/month)
4. Under **"Advanced"** -> **"Environment Variables"**, add:
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `PYTHON_VERSION` | `3.11.9` | Ensures compatible Python runtime |
   | `FLASK_DEBUG` | `0` | Production mode |
   | `CORS_ORIGINS` | `*` | Permits API calls |
5. Click **"Create Web Service"**.

---

## ✅ Post-Deployment Verification Checklist

Once the deployment status shows **"Live"**, verify your deployment:

1. **Live Health Check:**  
   Open `https://<your-render-subdomain>.onrender.com/api/health` in your browser.  
   Expected JSON response:
   ```json
   {
     "status": "healthy",
     "service": "CreditGuard Fraud Detection Engine",
     "readiness": {
       "all_systems_operational": true,
       "dataset_available": true,
       "models_trained": true,
       "scaler_ready": true
     }
   }
   ```

2. **Frontend UI:**  
   Open `https://<your-render-subdomain>.onrender.com/`. Verify that the dashboard loads, charts display, and live monitoring simulation works.

3. **Inference API:**  
   Navigate to the **Fraud Prediction Tool** (`/predict`), click **"Fill Known Fraud Vector"**, and verify real-time inference prediction.

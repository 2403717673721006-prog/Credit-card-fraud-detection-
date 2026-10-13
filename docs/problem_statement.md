# Component A: Problem Identification & Literature Survey (5 Marks)
**Course:** 22MDC56 Machine Learning Laboratory  
**Project:** CreditGuard — Real-Time Fraud Monitoring & Credit Card Fraud Detection System

---

## 1. Problem Statement
In contemporary electronic commerce and card-not-present (CNP) financial clearing networks, payment card fraud inflicts tens of billions of dollars in annual global losses. Rapid digitalization has amplified transaction velocity while obscuring malicious vectors. 

The central engineering challenge is the **severe class imbalance**:
- Fraudulent transactions constitute an extreme minority (less than 0.2% of global volume).
- In the research benchmark dataset, only **492 out of 284,807 transactions (0.1727%)** are fraudulent (an imbalance ratio of **577:1**).
- Standard classification algorithms optimized for naive accuracy succumb to the **Accuracy Paradox**: a trivial model that labels every single transaction as "Legitimate" achieves **99.827% accuracy** while missing 100% of criminal activity ($0 fraud interception).
- Conversely, naive thresholding and poorly calibrated re-weighting create excessive **False Positives** (false declines), blocking genuine cardholder purchases, damaging institutional reputation, and inducing significant operational intervention expenses.

## 2. Project Objectives
1. **Leak-Free Preprocessing Pipeline:** Develop a strictly isolated preprocessing and feature scaling workflow using `RobustScaler` on skewed features (`Time`, `Amount`) while preserving orthogonal PCA coordinates.
2. **Benchmark Machine Learning Algorithms:** Systematically train, cross-validate, and evaluate four core classification families:
   - Logistic Regression (Linear baseline with class weights)
   - Decision Tree Classifier (Rule-based partitioning)
   - Random Forest Classifier (Bootstrap aggregated ensemble)
   - K-Nearest Neighbors Classifier (Instance-based metric learning with under-sampled indexing)
3. **Imbalance-Aware Metric Evaluation:** Prioritize **Average Precision (PR-AUC)**, **F1-Score**, and **Recall** over misleading accuracy metrics.
4. **Real-Time Transaction Stream Simulation:** Implement an interactive monitoring dashboard with configurable decision thresholds, risk stratification, and low-latency inference APIs.
5. **Production Architectural Recommendations:** Provide institutional recommendations on fraud-loss vs. customer-friction trade-offs and tiered review routing.

## 3. Existing System Limitations
| Parameter | Conventional Heuristic Rules | Traditional ML Systems |
| :--- | :--- | :--- |
| **Adaptability** | Rigid hardcoded rules (e.g., amount > $1000) easily bypassed by card-testing micro-frauds. | Slow batch retraining with severe latency. |
| **Imbalance Handling** | Completely ignores prior probability distribution. | Oversamples test sets (data leakage) or optimizes accuracy. |
| **False Positive Management** | Overly aggressive alerts causing customer checkout abandonment. | High alert fatigue for compliance and security analysts. |
| **Threshold Adaptability** | Static Boolean triggers (Pass / Fail). | Fixed 0.5 threshold unsuited for dynamic risk postures. |

## 4. Literature Survey Summary
1. **Dal Pozzolo et al. (2015) — "Calibrating Probability with Undersampling for Unbalanced Classification in Credit Card Fraud Detection":**
   Demonstrates that under-sampling the majority class accelerates convergence but distorts posterior probabilities, requiring calibration prior to operational deployment.
2. **Carminati et al. (2015) — "BankSealer: An Unsupervised Risk Prioritization Engine":**
   Highlights that unsupervised clustering complements supervised classifiers by identifying emergent zero-day fraud modalities.
3. **Bhattacharyya et al. (2011) — "Utility of Machine Learning Approaches in Credit Card Fraud Detection":**
   Establishes that ensemble methods (Random Forest, Gradient Boosting) consistently outperform single decision trees and linear models in Precision-Recall trade-offs.

## 5. Research Gap
- Most academic projects restrict evaluation to static offline Jupyter Notebooks without operational API interfaces or realistic transaction streaming.
- Many implementations succumb to severe methodological flaws, such as fitting scalers across the full dataset prior to train-test splitting (data leakage).
- Traditional studies fail to decouple model predicted likelihood from ground-truth dataset labels, confusing simulated alerts with verified retrospective outcomes.

## 6. Proposed System: CreditGuard Architecture
CreditGuard bridges this academic-to-production gap:
- Complete segregation between offline training (`ml/`) and live RESTful scoring (`backend/`).
- Bounded, thread-safe transaction stream simulation reflecting institutional operations.
- Dynamic threshold calibration slider allowing risk officers to adjust posture between aggressive fraud containment and frictionless checkout.

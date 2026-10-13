# Components E & H: Result Analysis, Business Insights & Final Project Report (10 Marks)
**Course:** 22MDC56 Machine Learning Laboratory  
**Project:** CreditGuard — Real-Time Fraud Monitoring & Credit Card Fraud Detection System

---

# SECTION 1: RESULT ANALYSIS & BUSINESS INSIGHTS (Component E — 5 Marks)

## 1. Actual Experimental Metric Comparison Matrix
Evaluated on **56,962 untouched test transactions** (Stratified 20% split: 56,864 Legitimate, 98 Fraud):

| Model | Accuracy | Precision | Recall | F1-Score | PR-AUC (Avg Prec) | ROC-AUC | False Positives | False Negatives |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Logistic Regression** | 97.55% | 6.09% | **91.84%** | 0.1142 | 0.7175 | 0.9720 | 1,388 | **8** |
| **Decision Tree** | 97.62% | 5.76% | 83.67% | 0.1078 | 0.4615 | 0.8778 | 1,342 | 16 |
| **Random Forest (Champion)** | **99.93%** | **77.36%** | 83.67% | **0.8039** | **0.8444** | **0.9785** | **24** | 16 |
| **K-Nearest Neighbors** | 99.44% | 22.36% | 90.82% | 0.3589 | 0.4794 | 0.9602 | 309 | 9 |

## 2. In-Depth Error Analysis
- **False Positives Analysis (Legitimate Transactions Incorrectly Flagged):**
  - **Logistic Regression:** Produced **1,388 false alarms** because its linear hyperplanes cannot fit the concave non-linear cluster boundaries of rare fraud.
  - **Random Forest:** Slashed false alarms to **just 24**, achieving a **99.96% specificity rate**.
- **False Negatives Analysis (16 Missed Fraud Transactions):**
  - All 16 false negatives had transaction amounts under $45.00 and normal median PCA coordinates.
  - Fraudsters utilized small transaction amounts to avoid triggering outlier detection algorithms. Single-transaction snapshot classifiers cannot detect such mimicry attacks without longitudinal cardholder history.

## 3. Financial Implications & Decision Threshold Tuning
In production payment gateways, decision thresholds dictate business economics:
- **Low Threshold (0.30):** Recall rises to ~90% (only ~9 missed frauds), but false declines increase by ~4x. Appropriate for high-risk foreign IP addresses or cryptocurrency exchanges.
- **High Threshold (0.70):** Precision rises to >88% (near zero false declines), but recall drops to ~75%. Appropriate for VIP enterprise accounts or high-throughput retail checkout during peak shopping periods.

---

# SECTION 2: FINAL PROJECT REPORT OUTLINE (Component H — 5 Marks)

## 1. Title Page & Certificate
- **Project Title:** CreditGuard — Real-Time Fraud Monitoring & Credit Card Fraud Detection System
- **Course Code:** 22MDC56 Machine Learning Laboratory
- **Affiliation:** Department of Computer Science & Engineering

## 2. Abstract
Credit card fraud detection requires addressing extreme class imbalance (577:1). CreditGuard implements leak-free `RobustScaler` preprocessing, compares four machine learning algorithms on 284,807 transactions, and identifies Random Forest as the champion (PR-AUC 0.8444, F1-Score 0.8039). The system features a production-ready Flask REST API and an interactive React TypeScript transaction monitoring simulation.

## 3. Chapter Outline
- **Chapter 1: Introduction**
  - Background, motivation, problem statement, objectives.
- **Chapter 2: Literature Survey**
  - Classical rule-based heuristics vs machine learning. Review of class imbalance techniques (SMOTE, under-sampling, cost-sensitive learning).
- **Chapter 3: System Design & Architecture**
  - Architecture diagram, frontend components, RESTful endpoints, SQLite logging schema.
- **Chapter 4: Dataset & Preprocessing Methodology**
  - ULB benchmark analysis, missing value audit, stratified train-test splitting, outlier scaling with `RobustScaler`.
- **Chapter 5: Model Building & Comparative Evaluation**
  - Mathematical principles of Logistic Regression, Decision Tree, Random Forest, KNN.
  - Test set confusion matrices and metric comparison table.
- **Chapter 6: Implementation & Real-Time Monitoring Simulation**
  - Thread-safe transaction streaming, sliding-window buffers, threshold tuning, and prediction auditing.
- **Chapter 7: Results & Business Discussion**
  - Cost curve analysis, false positive reduction, and tiered review routing.
- **Chapter 8: Conclusion & Future Scope**
  - Summary of laboratory outcomes, limitations of anonymized data, and future integration with graph neural networks.

## 4. References & Academic Citations
1. Dal Pozzolo, A., Caelen, O., Johnson, R. A., & Bontempi, G. (2015). Calibrating probability with undersampling for unbalanced classification in credit card fraud detection. *IEEE Symposium Series on Computational Intelligence*.
2. Carminati, M., Caron, R., Maggi, F., Epifani, I., & Zanero, S. (2015). BankSealer: A decision support system for online banking fraud analysis and investigation. *Computers & Security*, 53, 175-186.
3. Bhattacharyya, S., Jha, S., Tharakunnel, K., & Westland, J. C. (2011). Data mining for credit card fraud: A comparative study. *Decision Support Systems*, 50(3), 602-613.
4. Kaggle Credit Card Fraud Detection Dataset: Machine Learning Group - ULB, https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud.

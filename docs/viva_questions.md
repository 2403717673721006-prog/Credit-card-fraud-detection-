# Component G: Presentation Outline & Comprehensive Viva Guide (5 Marks)
**Course:** 22MDC56 Machine Learning Laboratory  
**Project:** CreditGuard — Real-Time Fraud Monitoring & Credit Card Fraud Detection System

---

# SECTION 1: PRESENTATION SLIDE DECK OUTLINE (10-Minute Academic Defense)

- **Slide 1: Title & Course Introduction**
  - Project Title: CreditGuard — Real-Time Fraud Monitoring & Credit Card Fraud Detection System
  - Course: 22MDC56 Machine Learning Laboratory
  - Academic Year & Student Details
- **Slide 2: Problem Identification & Research Gap**
  - Financial fraud scale; The severe 577:1 class imbalance challenge.
  - The Accuracy Paradox: Why 99.8% accuracy is misleading.
- **Slide 3: Dataset Architecture & Quality Audit**
  - Kaggle ULB Benchmark (284,807 transactions, 492 fraud cases, 0 nulls, 1,081 duplicates).
  - PCA anonymization context (V1-V28) vs raw physical attributes (`Time`, `Amount`).
- **Slide 4: Leak-Free Preprocessing Pipeline**
  - Stratified 80/20 train-test partitioning.
  - Why `RobustScaler` was chosen over `StandardScaler` for skewed amounts.
- **Slide 5: Machine Learning Algorithm Benchmark**
  - Overview of 4 algorithms: Logistic Regression, Decision Tree, Random Forest, KNN.
  - How class weights (`class_weight='balanced'`) and KNN under-sampling were formulated.
- **Slide 6: Empirical Results & Confusion Matrix Analysis**
  - Cross-comparison table: Accuracy, Precision, Recall, F1, PR-AUC, False Positives.
  - Confusion matrix review on 56,962 test set transactions.
- **Slide 7: Model Selection & The Champion Architecture**
  - Why Random Forest won on Average Precision (0.8444) and F1-Score (0.8039).
  - Slashing False Positives from 1,388 down to 24 (98.3% noise reduction).
- **Slide 8: Real-Time Monitoring & REST API Implementation**
  - Decoupled Flask backend architecture, SQLite audit trail, React 18 TypeScript dashboard.
  - Live simulation controls: Start, Pause, Resume, Reset, and configurable threshold slider.
- **Slide 9: Business Insights & Friction vs Fraud Trade-offs**
  - Tiered review routing (Approve, Challenge with OTP, Decline).
  - Dynamic threshold impact (0.30 vs 0.70).
- **Slide 10: Conclusion, Limitations & Future Work**
  - Concept drift monitoring; Graph neural networks and velocity counters for future work.

---

# SECTION 2: CORE DEFINITIONS FOR MACHINE LEARNING VIVA

1. **Class Imbalance:** A dataset distribution where instances of one class (majority) drastically outnumber the other class (minority), e.g., 99.83% legitimate vs. 0.17% fraud.
2. **Accuracy Paradox:** The phenomenon where a predictive model has high accuracy (e.g., 99.8%) but entirely fails to classify the critical minority class of interest.
3. **Precision:** The proportion of positive identifications that were actually correct:
   $$\text{Precision} = \frac{TP}{TP + FP}$$
4. **Recall (Sensitivity):** The proportion of actual positives that were correctly identified:
   $$\text{Recall} = \frac{TP}{TP + FN}$$
5. **F1-Score:** The harmonic mean of Precision and Recall, balancing false alarms against missed detections:
   $$F_1 = 2 \times \frac{\text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}}$$
6. **PR-AUC (Average Precision):** Area under the Precision-Recall curve, directly summarizing classifier performance under extreme class imbalance without being influenced by massive True Negatives.
7. **ROC-AUC:** Area under the Receiver Operating Characteristic curve plotting True Positive Rate vs False Positive Rate.
8. **Data Leakage:** Information from outside the training dataset being inadvertently used to create or scale the model (e.g. fitting scalers on test data).
9. **RobustScaler:** A feature scaler that removes the median and scales data according to the Interquartile Range (IQR = Q75 - Q25), resisting severe outliers.
10. **PCA (Principal Component Analysis):** An orthogonal linear transformation that maps correlated continuous features into linearly uncorrelated principal components.

---

# SECTION 3: 25 VIVA QUESTIONS AND EXPERT BEGINNER-FRIENDLY ANSWERS

### Q1: What is the main objective of the CreditGuard project?
**Answer:** To develop an end-to-end credit card fraud detection application that addresses extreme class imbalance, benchmarks four classification algorithms, identifies the optimal model based on Average Precision (PR-AUC), and provides a simulated real-time monitoring interface with REST APIs.

### Q2: Why is raw accuracy a deceptive evaluation metric for fraud detection?
**Answer:** Because fraud represents only 0.17% of the dataset. A trivial baseline model that predicts every transaction as legitimate achieves 99.83% accuracy while catching zero fraud cases. Therefore, metrics like Recall, Precision, F1-Score, and Average Precision are necessary.

### Q3: What dataset was used and what are its dimensions?
**Answer:** The publicly available Kaggle ULB Credit Card Fraud dataset containing 284,807 European cardholder transactions across 48 hours, with 30 continuous input features and 1 binary target (`Class`).

### Q4: Why are features V1 through V28 anonymized in the dataset?
**Answer:** For cardholder confidentiality and regulatory privacy. The researchers applied Principal Component Analysis (PCA) to transform the original physical attributes (e.g. cardholder location, card numbers, merchant categories) into numerical orthogonal components.

### Q5: Which features in the dataset were NOT transformed via PCA?
**Answer:** Only `Time` (seconds elapsed from the first recorded transaction) and `Amount` (the dollar transaction amount).

### Q6: What is data leakage and how did you prevent it?
**Answer:** Data leakage occurs when test set distribution parameters influence training. We prevented it by performing a stratified 80/20 train-test split first, and fitting `RobustScaler` strictly on the training partition (`X_train[['Time', 'Amount']]`), then using that fitted scaler to transform the test set.

### Q7: Why did you use RobustScaler instead of StandardScaler or MinMaxScaler?
**Answer:** Because transaction amounts exhibit extreme outliers (ranging from $0.00 to over $25,691.00 while the median is just $22.00). `StandardScaler` uses the mean and variance which are heavily distorted by outliers, whereas `RobustScaler` uses the median and Interquartile Range (IQR), preserving the distribution of normal transactions.

### Q8: What does the `stratify=y` parameter do in `train_test_split`?
**Answer:** It ensures that both the training set (80%) and test set (20%) maintain the exact same proportion of fraudulent transactions (~0.173%) as the original population, preventing train or test splits from having zero or disproportionate fraud cases.

### Q9: Which four machine learning models did you train and compare?
**Answer:**
1. Logistic Regression
2. Decision Tree Classifier
3. Random Forest Classifier
4. K-Nearest Neighbors Classifier (KNN)

### Q10: How did you handle class imbalance during model training?
**Answer:** For Logistic Regression, Decision Trees, and Random Forest, we used algorithmic cost-sensitive weighting (`class_weight='balanced'`), which penalizes errors on the minority fraud class proportionally to its rarity. For KNN, we trained on an under-sampled balanced training partition (394 fraud + 1,970 legit) to prevent majority class drowning and eliminate the $O(N^2)$ distance latency bottleneck.

### Q11: Which model performed best and what were its key metrics?
**Answer:** **Random Forest Classifier** was the selected champion:
- Accuracy: 99.93%
- Precision: 77.36%
- Recall: 83.67% (82 out of 98 fraud cases caught)
- F1-Score: 0.8039
- Average Precision (PR-AUC): 0.8444
- False Positives: Only 24 out of 56,864 legitimate transactions.

### Q12: Why did Random Forest outperform Logistic Regression?
**Answer:** Logistic Regression achieved high recall (91.84%) but suffered from terrible precision (6.09%), generating 1,388 false alarms. Random Forest's non-linear ensemble of 100 decorrelated decision trees captured complex non-linear feature interactions (such as between V14, V17, and Amount), reducing false alarms to just 24 while maintaining 83.67% recall.

### Q13: What is the difference between Precision and Recall in this project?
**Answer:**
- **Recall** measures the percentage of actual fraud cases caught ($82/98 = 83.7\%$). High recall means fewer criminals slip through.
- **Precision** measures the percentage of fraud flags that were truly fraud ($82 / (82 + 24) = 77.4\%$). High precision means fewer legitimate customers are inconvenienced by false declines.

### Q14: What is a Confusion Matrix?
**Answer:** A $2 \times 2$ table showing the four combinations of actual vs. predicted outcomes:
- **True Negatives (TN):** Genuine transactions correctly approved.
- **False Positives (FP):** Genuine transactions incorrectly flagged as fraud (Type I error / False Decline).
- **False Negatives (FN):** Fraudulent transactions incorrectly approved (Type II error / Missed Fraud).
- **True Positives (TP):** Fraudulent transactions correctly intercepted.

### Q15: What were the Confusion Matrix numbers for Random Forest on the 56,962 test transactions?
**Answer:**
- $\text{TN} = 56,840$
- $\text{FP} = 24$
- $\text{FN} = 16$
- $\text{TP} = 82$

### Q16: Why was K-Nearest Neighbors trained on a balanced subsample instead of all 228k training rows?
**Answer:** KNN computes pairwise Euclidean distances. Calculating distances from 56,962 test points to 227,845 training points requires over 13 billion mathematical operations, which causes severe memory and CPU bottlenecks. Furthermore, in a 577:1 imbalance, every test point's 5 nearest neighbors are almost guaranteed to be legitimate (majority class drowning). Subsampling resolved both issues.

### Q17: What is the role of the decision threshold, and why is it configurable?
**Answer:** Models output a continuous probability score from 0.0 to 1.0. The decision threshold (default 0.5) is the boundary where a score becomes a fraud alert. Lowering the threshold to 0.30 increases Recall (catches more fraud but increases false declines); raising it to 0.70 increases Precision (fewer false declines but increases missed fraud risk).

### Q18: What is the technology stack used in CreditGuard?
**Answer:**
- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Lucide React, Recharts, React Router.
- **Backend:** Python 3.14, Flask, Flask-CORS, Joblib, SQLite3, Threading.
- **Machine Learning:** Scikit-Learn, Pandas, NumPy, Matplotlib, Seaborn.

### Q19: How is prediction history persisted in the system?
**Answer:** Using an embedded **SQLite database** (`creditguard.sqlite3`). Every manual prediction and simulated event is recorded with transaction ID, timestamp, amount, predicted class, risk score, model name, and ground truth label.

### Q20: How does the Real-Time Monitoring simulator work?
**Answer:** It uses a thread-safe singleton `MonitoringService` running a background daemon thread. It streams transactions from a test set sample, feeds each row to the active trained Joblib model, scores probability, updates sliding-window metrics, and maintains a bounded queue of recent transactions and critical fraud alerts.

### Q21: What are the top features correlated with fraud in the dataset?
**Answer:**
- **Negative correlation (inverse):** V14 ($r = -0.30$), V12 ($r = -0.26$), V10 ($r = -0.22$). When these values drop significantly, fraud likelihood increases.
- **Positive correlation:** V4 ($r = +0.13$), V11 ($r = +0.15$), V2 ($r = +0.09$).

### Q22: What happens if an invalid payload is sent to `POST /api/predict`?
**Answer:** The API performs strict schema validation. If required features are missing or contain non-numeric/NaN values, it immediately returns a structured `400 Bad Request` JSON error explaining the exact missing or malformed fields, preventing server crashes.

### Q23: Why did 16 fraudulent transactions slip through (False Negatives)?
**Answer:** Because their transaction amounts ($1 to $45) and PCA features closely resembled normal legitimate cardholder spending patterns. Single-transaction snapshot models cannot detect mimicry attacks without longitudinal behavioral velocity counters.

### Q24: What recommendations would you give to deploy CreditGuard in a production bank?
**Answer:**
1. A **3-Tier Routing Architecture:** Auto-approve (risk < 20%), Step-Up Challenge via OTP/biometrics (risk 20%-75%), and Auto-Decline (risk > 75%).
2. **Velocity Counters:** Track rapid swiping (e.g., 5 transactions in 2 minutes) using in-memory Redis caches.
3. **Concept Drift Retraining:** Automated weekly retraining on newly confirmed chargeback labels.

### Q25: What is the academic disclaimer of this project?
**Answer:** CreditGuard is an educational laboratory demonstration built for the 22MDC56 course. It operates on historical anonymized benchmark data and is not connected to a live banking payment gateway or real customer accounts.

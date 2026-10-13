export interface HealthStatus {
  status: string;
  service: string;
  timestamp: string;
  readiness: {
    dataset_available: boolean;
    models_trained: boolean;
    scaler_ready: boolean;
    all_systems_operational: boolean;
  };
}

export interface KeyFeatures {
  V1: number;
  V2: number;
  V3?: number;
  V4?: number;
  V14?: number;
  V17?: number;
  [key: string]: number | undefined;
}

export interface TransactionItem {
  transaction_id: string;
  time: number;
  amount: number;
  actual_class: number;
  actual_label: "Legitimate" | "Fraudulent";
  key_features: KeyFeatures;
  all_features?: Record<string, number>;
}

export interface PaginatedTransactions {
  items: TransactionItem[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
  error?: string;
}

export interface DatasetSummary {
  status: string;
  file_path: string;
  file_size_mb: number;
  total_rows: number;
  total_columns: number;
  columns: string[];
  total_nulls: number;
  duplicate_count: number;
  legitimate_count: number;
  fraud_count: number;
  fraud_percentage: number;
  amount_statistics: {
    min: number;
    max: number;
    mean: number;
    median: number;
    std: number;
  };
  dtypes?: Record<string, string>;
  message?: string;
}

export interface AmountBin {
  range: string;
  legitimate: number;
  fraud: number;
  fraud_rate: number;
}

export interface EdaSummary {
  total_records: number;
  features_count: number;
  legitimate_count: number;
  fraud_count: number;
  fraud_percentage: number;
  imbalance_ratio: string;
  missing_values_count: number;
  duplicate_rows: number;
  time_span_hours: number;
  amount_stats_legitimate: {
    mean: number;
    median: number;
    std: number;
    max: number;
    q25: number;
    q75: number;
  };
  amount_stats_fraudulent: {
    mean: number;
    median: number;
    std: number;
    max: number;
    q25: number;
    q75: number;
  };
  amount_distribution_bins: AmountBin[];
  top_correlated_features: Record<string, number>;
  key_insights: string[];
}

export interface CurvePoint {
  recall?: number;
  precision?: number;
  fpr?: number;
  tpr?: number;
}

export interface ModelMetrics {
  name: string;
  filename: string;
  description: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  average_precision: number;
  roc_auc: number;
  confusion_matrix: number[][];
  tn: number;
  fp: number;
  fn: number;
  tp: number;
  training_time_seconds: number;
  evaluation_time_seconds: number;
  test_total: number;
  test_fraud_actual: number;
  test_legit_actual: number;
  pr_curve?: CurvePoint[];
  roc_curve?: CurvePoint[];
}

export interface ModelComparisonResponse {
  selected_model: string;
  selection_metric: string;
  selection_rationale: string;
  models: Record<string, ModelMetrics>;
  status?: string;
}

export interface PredictionResult {
  prediction_id: string;
  predicted_class: number;
  prediction_label: "Legitimate" | "Fraudulent";
  risk_score: number;
  risk_percentage: number;
  risk_tier: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  risk_label: string;
  decision_threshold: number;
  model_name: string;
  amount: number;
  is_fraud_alert: boolean;
  disclaimer: string;
}

export interface PredictionHistoryItem {
  id: number;
  prediction_id: string;
  timestamp: string;
  amount: number;
  predicted_class: number;
  risk_score: number;
  decision_threshold: number;
  model_name: string;
  source: string;
  is_alert: number;
  ground_truth_class?: number | null;
}

export interface PredictionHistoryResponse {
  history: PredictionHistoryItem[];
  stats: {
    total_predictions: number;
    total_alerts: number;
    alert_rate: number;
  };
  limit: number;
  offset: number;
}

export interface SimulatedTransaction {
  transaction_id: string;
  timestamp: string;
  amount: number;
  predicted_class: number;
  prediction_label: string;
  risk_score: number;
  risk_tier: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  risk_label: string;
  actual_class: number;
  actual_label: string;
  model_name: string;
  key_features: KeyFeatures;
  is_alert: boolean;
}

export interface SimulatedAlert {
  alert_id: string;
  transaction_id: string;
  timestamp: string;
  amount: number;
  risk_score: number;
  risk_tier: string;
  actual_class: number;
  reason: string;
}

export interface MonitoringStatus {
  state: "STOPPED" | "RUNNING" | "PAUSED";
  interval_seconds: number;
  decision_threshold: number;
  active_model: string;
  metrics: {
    total_processed: number;
    predicted_fraud_count: number;
    predicted_legit_count: number;
    ground_truth_fraud_count: number;
    fraud_alert_rate: number;
  };
  recent_transactions: SimulatedTransaction[];
  recent_alerts: SimulatedAlert[];
}

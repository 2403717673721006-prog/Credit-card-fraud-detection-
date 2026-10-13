import {
  HealthStatus,
  DatasetSummary,
  PaginatedTransactions,
  TransactionItem,
  EdaSummary,
  ModelComparisonResponse,
  PredictionResult,
  PredictionHistoryResponse,
  MonitoringStatus,
} from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "http://127.0.0.1:5000/api" : "/api");


class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMsg = `Server error: ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson.error) {
        errorMsg = errJson.error;
      }
    } catch {
      // Use standard status text
    }
    throw new ApiError(errorMsg, response.status);
  }
  return response.json();
}

export const api = {
  async getHealth(): Promise<HealthStatus> {
    const res = await fetch(`${API_BASE_URL}/health`);
    return handleResponse<HealthStatus>(res);
  },

  async getDatasetSummary(): Promise<DatasetSummary> {
    const res = await fetch(`${API_BASE_URL}/dataset/summary`);
    return handleResponse<DatasetSummary>(res);
  },

  async getTransactions(params: {
    page?: number;
    per_page?: number;
    class_filter?: number;
    min_amount?: number;
    max_amount?: number;
    sort_by?: string;
    sort_order?: string;
    search?: string;
  } = {}): Promise<PaginatedTransactions> {
    const query = new URLSearchParams();
    if (params.page) query.append("page", params.page.toString());
    if (params.per_page) query.append("per_page", params.per_page.toString());
    if (params.class_filter !== undefined && params.class_filter !== null) {
      query.append("class_filter", params.class_filter.toString());
    }
    if (params.min_amount !== undefined) query.append("min_amount", params.min_amount.toString());
    if (params.max_amount !== undefined) query.append("max_amount", params.max_amount.toString());
    if (params.sort_by) query.append("sort_by", params.sort_by);
    if (params.sort_order) query.append("sort_order", params.sort_order);
    if (params.search) query.append("search", params.search);

    const res = await fetch(`${API_BASE_URL}/dataset/transactions?${query.toString()}`);
    return handleResponse<PaginatedTransactions>(res);
  },

  async getTransactionById(txId: string): Promise<TransactionItem> {
    const res = await fetch(`${API_BASE_URL}/dataset/transactions/${encodeURIComponent(txId)}`);
    return handleResponse<TransactionItem>(res);
  },

  async getEdaSummary(): Promise<EdaSummary> {
    const res = await fetch(`${API_BASE_URL}/eda/summary`);
    return handleResponse<EdaSummary>(res);
  },

  async getModelComparison(): Promise<ModelComparisonResponse> {
    const res = await fetch(`${API_BASE_URL}/models/comparison`);
    return handleResponse<ModelComparisonResponse>(res);
  },

  async predict(payload: {
    features: Record<string, number>;
    model_name?: string;
    threshold?: number;
    source?: string;
    ground_truth_class?: number | null;
  }): Promise<PredictionResult> {
    const res = await fetch(`${API_BASE_URL}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<PredictionResult>(res);
  },

  async getPredictionHistory(limit: number = 30, offset: number = 0): Promise<PredictionHistoryResponse> {
    const res = await fetch(`${API_BASE_URL}/predictions/history?limit=${limit}&offset=${offset}`);
    return handleResponse<PredictionHistoryResponse>(res);
  },

  async getMonitoringStatus(): Promise<MonitoringStatus> {
    const res = await fetch(`${API_BASE_URL}/monitoring/status`);
    return handleResponse<MonitoringStatus>(res);
  },

  async startMonitoring(params: {
    interval_seconds?: number;
    threshold?: number;
    model_name?: string;
  } = {}): Promise<MonitoringStatus> {
    const res = await fetch(`${API_BASE_URL}/monitoring/start`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    return handleResponse<MonitoringStatus>(res);
  },

  async pauseMonitoring(): Promise<MonitoringStatus> {
    const res = await fetch(`${API_BASE_URL}/monitoring/pause`, {
      method: "POST",
    });
    return handleResponse<MonitoringStatus>(res);
  },

  async resumeMonitoring(): Promise<MonitoringStatus> {
    const res = await fetch(`${API_BASE_URL}/monitoring/resume`, {
      method: "POST",
    });
    return handleResponse<MonitoringStatus>(res);
  },

  async resetMonitoring(): Promise<MonitoringStatus> {
    const res = await fetch(`${API_BASE_URL}/monitoring/reset`, {
      method: "POST",
    });
    return handleResponse<MonitoringStatus>(res);
  },
};

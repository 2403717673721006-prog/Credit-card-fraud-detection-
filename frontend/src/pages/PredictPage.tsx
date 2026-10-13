import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  Cpu,
  Sliders,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Zap,
  Info,
  Clock,
  DollarSign,
  History,
} from "lucide-react";
import { api } from "../services/api";
import { PredictionResult, PredictionHistoryItem } from "../types";
import { RiskBadge } from "../components/RiskBadge";

// Baseline benchmark vectors
const BENCHMARK_LEGIT: Record<string, number> = {
  Time: 125000,
  Amount: 54.20,
  V1: 0.12, V2: -0.05, V3: 0.45, V4: -0.20, V5: 0.15, V6: 0.05, V7: 0.10, V8: 0.02,
  V9: -0.08, V10: 0.04, V11: -0.15, V12: 0.22, V13: -0.10, V14: 0.35, V15: -0.05,
  V16: 0.18, V17: 0.25, V18: -0.10, V19: 0.05, V20: -0.02, V21: -0.03, V22: 0.08,
  V23: -0.04, V24: 0.12, V25: -0.06, V26: 0.02, V27: 0.01, V28: -0.01,
};

const BENCHMARK_FRAUD: Record<string, number> = {
  Time: 406.0,
  Amount: 0.0,
  V1: -2.31, V2: 1.95, V3: -1.61, V4: 3.99, V5: -0.52, V6: -1.43, V7: -2.54, V8: 1.39,
  V9: -2.77, V10: -2.77, V11: 3.20, V12: -2.90, V13: -0.60, V14: -4.29, V15: 0.39,
  V16: -1.14, V17: -2.83, V18: -0.02, V19: 0.42, V20: 0.13, V21: 0.52, V22: -0.04,
  V23: -0.47, V24: 0.32, V25: 0.04, V26: 0.18, V27: 0.26, V28: -0.14,
};

export const PredictPage: React.FC = () => {
  const [features, setFeatures] = useState<Record<string, number>>(BENCHMARK_LEGIT);
  const [modelName, setModelName] = useState<string>("Random Forest");
  const [threshold, setThreshold] = useState<number>(0.5);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"key" | "all">("key");
  const [history, setHistory] = useState<PredictionHistoryItem[]>([]);
  const [sourceNote, setSourceNote] = useState<string | null>(null);

  // Check if a transaction was transferred from Monitoring Page
  useEffect(() => {
    const raw = sessionStorage.getItem("creditguard_test_row");
    if (raw) {
      try {
        const item = JSON.parse(raw);
        if (item.features) {
          setFeatures(item.features);
          setSourceNote(`Loaded Transaction ${item.transaction_id} (Ground Truth: Class ${item.actual_class})`);
          sessionStorage.removeItem("creditguard_test_row");
        }
      } catch (err) {
        // ignore
      }
    }
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.getPredictionHistory(10, 0);
      setHistory(res.history);
    } catch {
      // ignore
    }
  };

  const handleInputChange = (field: string, valStr: string) => {
    const parsed = parseFloat(valStr);
    setFeatures((prev) => ({
      ...prev,
      [field]: isNaN(parsed) ? 0 : parsed,
    }));
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.predict({
        features,
        model_name: modelName,
        threshold: threshold,
        source: sourceNote ? "dataset_row" : "manual",
      });
      setResult(res);
      fetchHistory();
    } catch (err: any) {
      setError(err.message || "Prediction execution failed.");
    } finally {
      setLoading(false);
    }
  };

  const loadPreset = (type: "legit" | "fraud") => {
    setFeatures(type === "legit" ? BENCHMARK_LEGIT : BENCHMARK_FRAUD);
    setSourceNote(type === "legit" ? "Loaded Benchmark Legitimate Vector" : "Loaded Benchmark Fraudulent Vector");
    setResult(null);
  };

  const handleReset = () => {
    setFeatures(BENCHMARK_LEGIT);
    setResult(null);
    setError(null);
    setSourceNote(null);
  };

  const topKeyFeatures = ["V14", "V17", "V12", "V10", "V4", "V11", "V2", "V1"];
  const remainingPCA = Array.from({ length: 28 }, (_, i) => `V${i + 1}`).filter(
    (k) => !topKeyFeatures.includes(k)
  );

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Interactive Fraud Prediction Tool
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Submit numeric feature vectors to evaluate fraud likelihood through trained machine learning models.
          </p>
        </div>

        {/* Quick Fill Preset Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => loadPreset("legit")}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition"
          >
            <CheckCircle className="h-3.5 w-3.5" />
            <span>Fill Sample Legitimate</span>
          </button>
          <button
            type="button"
            onClick={() => loadPreset("fraud")}
            className="flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition"
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Fill Known Fraud Vector</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-700 hover:text-white transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {sourceNote && (
        <div className="rounded-xl border border-cyan-800/50 bg-cyan-950/30 px-4 py-2.5 text-xs text-cyan-300 flex items-center justify-between">
          <span>{sourceNote}</span>
          <button onClick={() => setSourceNote(null)} className="text-cyan-400 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Form on Left, Output Result on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form Column (2 Cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
          <form onSubmit={handlePredict} className="space-y-6">
            {/* Top Parameters: Model Selection & Threshold */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-slate-800">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                  Classifier Algorithm
                </label>
                <div className="relative">
                  <select
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-[#080d1a] py-2.5 px-3 text-xs text-slate-100 font-medium focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="Random Forest">Random Forest (Champion - PR-AUC 0.844)</option>
                    <option value="Logistic Regression">Logistic Regression (Balanced)</option>
                    <option value="Decision Tree">Decision Tree (Max Depth 7)</option>
                    <option value="K-Nearest Neighbors">K-Nearest Neighbors (k=5)</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Classification Threshold
                  </label>
                  <span className="font-mono text-xs font-bold text-cyan-400">
                    {(threshold * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.10"
                  max="0.90"
                  step="0.05"
                  value={threshold}
                  onChange={(e) => setThreshold(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>10% (High Recall / Aggressive)</span>
                  <span>50% (Standard)</span>
                  <span>90% (High Precision)</span>
                </div>
              </div>
            </div>

            {/* Core Transaction Metadata: Time & Amount */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>Core Transaction Fields</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Time (Seconds elapsed from first transaction)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={features.Time ?? 0}
                    onChange={(e) => handleInputChange("Time", e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-[#080d1a] py-2 px-3 text-xs font-mono text-white focus:border-cyan-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    Amount (Transaction Dollar Amount $)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={features.Amount ?? 0}
                    onChange={(e) => handleInputChange("Amount", e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-[#080d1a] py-2 px-3 text-xs font-mono text-white focus:border-cyan-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Top Discriminative PCA Components */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Top Correlated PCA Indicators</span>
                </h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("key")}
                    className={`px-2.5 py-1 text-[11px] rounded-lg font-medium transition ${
                      activeTab === "key"
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Top 8 Features
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("all")}
                    className={`px-2.5 py-1 text-[11px] rounded-lg font-medium transition ${
                      activeTab === "all"
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    All 28 Components
                  </button>
                </div>
              </div>

              {/* Top Key Features Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {topKeyFeatures.map((feat) => (
                  <div key={feat} className="rounded-xl border border-slate-800 bg-[#080d1a] p-2.5">
                    <label className="text-[11px] font-mono font-bold text-slate-300 block mb-1">
                      {feat}
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={features[feat] ?? 0}
                      onChange={(e) => handleInputChange(feat, e.target.value)}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 py-1.5 px-2 text-xs font-mono text-cyan-300 focus:border-cyan-500 focus:outline-none"
                      required
                    />
                  </div>
                ))}
              </div>

              {/* Remaining PCA (Shown if 'all' tab selected) */}
              {activeTab === "all" && (
                <div className="mt-4 pt-4 border-t border-slate-800/80">
                  <p className="text-[11px] text-slate-400 mb-2 font-medium">
                    Remaining Anonymized Components (V1 - V28):
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                    {remainingPCA.map((feat) => (
                      <div key={feat} className="rounded-lg border border-slate-800 bg-[#080d1a] p-2">
                        <label className="text-[10px] font-mono text-slate-400 block mb-0.5">
                          {feat}
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={features[feat] ?? 0}
                          onChange={(e) => handleInputChange(feat, e.target.value)}
                          className="w-full rounded border border-slate-800 bg-slate-900 py-1 px-1.5 text-[11px] font-mono text-slate-200 focus:border-cyan-500 focus:outline-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-3 text-xs text-red-300 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 py-3 text-sm font-bold text-slate-950 hover:from-cyan-400 hover:to-teal-400 shadow-lg shadow-cyan-950/40 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Zap className="h-4 w-4 fill-current" />
              <span>{loading ? "Running Model Inference..." : "Evaluate Fraud Likelihood"}</span>
            </button>
          </form>
        </div>

        {/* Prediction Results Card (1 Col) */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-2">
              <Cpu className="h-4 w-4 text-cyan-400" />
              <span>Inference Assessment</span>
            </h3>

            {result ? (
              <div className="space-y-5">
                {/* Result Status Banner */}
                <div
                  className={`rounded-xl border p-4 text-center ${
                    result.predicted_class === 1
                      ? "border-red-500/40 bg-red-950/30 text-red-400"
                      : "border-emerald-500/30 bg-emerald-950/30 text-emerald-400"
                  }`}
                >
                  <div className="text-xs uppercase font-mono tracking-wider font-semibold">
                    Predicted Classification
                  </div>
                  <div className="text-2xl font-black font-mono mt-1">
                    {result.prediction_label.toUpperCase()}
                  </div>
                  <p className="text-[11px] opacity-80 mt-1">
                    Model: {result.model_name}
                  </p>
                </div>

                {/* Risk Score Meter */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs text-slate-400">Algorithmic Risk Score</span>
                    <span className="font-mono text-base font-bold text-white">
                      {(result.risk_score * 100).toFixed(1)}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        result.risk_score >= 0.8
                          ? "bg-red-500"
                          : result.risk_score >= 0.5
                          ? "bg-orange-500"
                          : result.risk_score >= 0.2
                          ? "bg-amber-400"
                          : "bg-emerald-400"
                      }`}
                      style={{ width: `${Math.min(100, Math.max(3, result.risk_score * 100))}%` }}
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Assigned Tier:</span>
                    <RiskBadge score={result.risk_score} tier={result.risk_tier} size="sm" />
                  </div>

                  <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                    <span>Threshold Applied:</span>
                    <span className="font-mono font-bold text-cyan-300">
                      {(result.decision_threshold * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Audit ID */}
                <div className="rounded-lg border border-slate-800/80 bg-slate-900/30 p-2.5 text-[11px] font-mono text-slate-400 flex justify-between">
                  <span>Log Reference:</span>
                  <span className="text-slate-200">{result.prediction_id}</span>
                </div>

                {/* Disclaimer */}
                <p className="text-[10px] text-slate-500 leading-relaxed border-t border-slate-800 pt-3">
                  {result.disclaimer}
                </p>
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-slate-500 space-y-2">
                <ShieldAlert className="h-8 w-8 mx-auto text-slate-600" />
                <p>No prediction evaluated yet.</p>
                <p className="text-[11px] text-slate-400">
                  Select sample inputs or specify custom feature coordinates, then click "Evaluate Fraud Likelihood".
                </p>
              </div>
            )}
          </div>

          {/* Recent SQLite Prediction History */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <History className="h-3.5 w-3.5" />
              <span>Persistent Prediction Log (SQLite)</span>
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {history.length > 0 ? (
                history.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-slate-800 bg-slate-900/30 p-2 text-xs flex items-center justify-between font-mono"
                  >
                    <div>
                      <span className="font-bold text-white">${item.amount.toFixed(2)}</span>
                      <span className="text-[10px] text-slate-400 block">{item.model_name}</span>
                    </div>
                    <RiskBadge score={item.risk_score} size="sm" />
                  </div>
                ))
              ) : (
                <p className="text-[11px] text-slate-500 text-center py-4">
                  No previous manual evaluations logged.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

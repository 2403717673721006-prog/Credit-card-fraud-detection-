import React, { useEffect, useState, useRef } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  ShieldAlert,
  Activity,
  CheckCircle,
  AlertTriangle,
  ArrowUpRight,
  Sliders,
  DollarSign,
  TrendingDown,
  Info,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { api } from "../services/api";
import { MonitoringStatus, SimulatedTransaction, TransactionItem } from "../types";
import { MetricCard } from "../components/MetricCard";
import { RiskBadge } from "../components/RiskBadge";
import { TransactionDetailModal } from "../components/TransactionDetailModal";

export const DashboardPage: React.FC = () => {
  const [status, setStatus] = useState<MonitoringStatus | null>(null);
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);
  const [threshold, setThreshold] = useState<number>(0.5);
  const [speed, setSpeed] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isPollingRef = useRef(true);

  const fetchStatus = async () => {
    try {
      const data = await api.getMonitoringStatus();
      setStatus(data);
      setThreshold(data.decision_threshold);
      setError(null);
    } catch (err: any) {
      setError("Unable to connect to monitoring stream engine.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    // Poll every 1.2 seconds when page is open
    const interval = setInterval(() => {
      if (isPollingRef.current) {
        fetchStatus();
      }
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  const handleStart = async () => {
    try {
      const res = await api.startMonitoring({
        interval_seconds: speed,
        threshold: threshold,
      });
      setStatus(res);
    } catch (err: any) {
      setError(err.message || "Failed to start simulation");
    }
  };

  const handlePause = async () => {
    try {
      const res = await api.pauseMonitoring();
      setStatus(res);
    } catch (err: any) {
      setError(err.message || "Failed to pause");
    }
  };

  const handleResume = async () => {
    try {
      const res = await api.resumeMonitoring();
      setStatus(res);
    } catch (err: any) {
      setError(err.message || "Failed to resume");
    }
  };

  const handleReset = async () => {
    try {
      const res = await api.resetMonitoring();
      setStatus(res);
    } catch (err: any) {
      setError(err.message || "Failed to reset");
    }
  };

  const handleInspect = (simTx: SimulatedTransaction) => {
    // Convert simulated transaction to TransactionItem format for modal
    const item: TransactionItem = {
      transaction_id: simTx.transaction_id,
      time: 0,
      amount: simTx.amount,
      actual_class: simTx.actual_class,
      actual_label: simTx.actual_class === 1 ? "Fraudulent" : "Legitimate",
      key_features: simTx.key_features,
      all_features: {
        Amount: simTx.amount,
        ...simTx.key_features,
      },
    };
    setSelectedTx(item);
  };

  const metrics = status?.metrics || {
    total_processed: 0,
    predicted_fraud_count: 0,
    predicted_legit_count: 0,
    fraud_alert_rate: 0,
  };

  const pieData = [
    { name: "Legitimate", value: metrics.predicted_legit_count, color: "#10b981" },
    { name: "Fraud Alert", value: metrics.predicted_fraud_count, color: "#ef4444" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight text-white">
              Real-Time Fraud Monitoring Dashboard
            </h1>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-mono font-semibold uppercase ${
                status?.state === "RUNNING"
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 animate-pulse"
                  : status?.state === "PAUSED"
                  ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                  : "bg-slate-800 text-slate-400 border border-slate-700"
              }`}
            >
              {status?.state || "STOPPED"}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Simulated live transaction stream analyzed through active Random Forest model (Trained on Kaggle Credit Card dataset).
          </p>
        </div>

        {/* Simulator Controls */}
        <div className="flex flex-wrap items-center gap-2.5 bg-slate-900/80 border border-slate-800 rounded-xl p-2 backdrop-blur-md">
          {status?.state === "RUNNING" ? (
            <button
              onClick={handlePause}
              className="flex items-center gap-1.5 rounded-lg bg-amber-500/15 border border-amber-500/40 px-3 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/25 transition"
            >
              <Pause className="h-3.5 w-3.5" />
              <span>Pause</span>
            </button>
          ) : status?.state === "PAUSED" ? (
            <button
              onClick={handleResume}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30 transition"
            >
              <Play className="h-3.5 w-3.5" />
              <span>Resume</span>
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:from-cyan-400 hover:to-teal-400 shadow-md shadow-cyan-950/40 transition"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Start Stream</span>
            </button>
          )}

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 px-2.5 py-1.5 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
            title="Reset Counters"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>

          {/* Speed Selector */}
          <div className="flex items-center gap-1.5 border-l border-slate-800 pl-2 text-xs text-slate-400">
            <span className="text-[11px]">Speed:</span>
            <select
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="rounded bg-slate-800 border border-slate-700 px-2 py-1 text-xs text-slate-200 font-mono"
            >
              <option value={0.5}>0.5s</option>
              <option value={1.0}>1.0s</option>
              <option value={2.0}>2.0s</option>
            </select>
          </div>

          {/* Threshold setting */}
          <div className="flex items-center gap-1.5 border-l border-slate-800 pl-2 text-xs text-slate-400">
            <Sliders className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-[11px]">Threshold:</span>
            <span className="font-mono text-cyan-300 font-bold">
              {(threshold * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Academic Disclaimer Alert */}
      <div className="flex items-start gap-3 rounded-xl border border-cyan-900/30 bg-cyan-950/20 p-3.5 text-xs text-cyan-200/90">
        <Info className="h-4 w-4 shrink-0 text-cyan-400 mt-0.5" />
        <p>
          <span className="font-bold text-cyan-300">Academic Demonstration Note:</span>{" "}
          This system simulates continuous transaction monitoring. Machine learning models classify incoming transactions based on PCA-transformed historical features. Model predictions and actual ground-truth dataset labels are kept strictly distinct.
        </p>
      </div>

      {/* Key Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Processed"
          value={metrics.total_processed.toLocaleString()}
          subtitle="Transactions Streamed"
          icon={Activity}
          variant="cyan"
        />
        <MetricCard
          title="Predicted Legitimate"
          value={metrics.predicted_legit_count.toLocaleString()}
          subtitle="Clear Transactions (Class 0)"
          icon={CheckCircle}
          variant="emerald"
        />
        <MetricCard
          title="Predicted Fraud Alerts"
          value={metrics.predicted_fraud_count.toLocaleString()}
          subtitle="Interception Triggers (Class 1)"
          icon={ShieldAlert}
          variant="rose"
        />
        <MetricCard
          title="Fraud Alert Rate"
          value={`${metrics.fraud_alert_rate.toFixed(2)}%`}
          subtitle="Of Processed Volume"
          icon={TrendingDown}
          variant={metrics.fraud_alert_rate > 5 ? "rose" : "amber"}
        />
      </div>

      {/* Middle Row: Live Feed and Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Transaction Feed (Takes 2 Columns) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-md p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-400">
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Simulated Transaction Feed
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Live sliding window of incoming transactions evaluated by model
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono text-slate-400">
                {status?.recent_transactions.length || 0} in buffer
              </span>
            </div>

            {/* Transactions Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800/80">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-400 uppercase font-mono text-[10px]">
                  <tr>
                    <th className="py-2.5 px-3">Tx ID</th>
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Risk Score</th>
                    <th className="py-2.5 px-3">Prediction</th>
                    <th className="py-2.5 px-3">Actual Label</th>
                    <th className="py-2.5 px-3 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {status?.recent_transactions && status.recent_transactions.length > 0 ? (
                    status.recent_transactions.slice(0, 8).map((tx) => (
                      <tr
                        key={tx.transaction_id}
                        className={`transition hover:bg-slate-800/40 ${
                          tx.predicted_class === 1 ? "bg-red-950/20" : ""
                        }`}
                      >
                        <td className="py-2.5 px-3 font-semibold text-slate-200">
                          {tx.transaction_id}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">{tx.timestamp}</td>
                        <td className="py-2.5 px-3 font-bold text-white">
                          ${tx.amount.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3">
                          <RiskBadge score={tx.risk_score} tier={tx.risk_tier} size="sm" />
                        </td>
                        <td className="py-2.5 px-3">
                          {tx.predicted_class === 1 ? (
                            <span className="text-red-400 font-bold">FRAUD ALERT</span>
                          ) : (
                            <span className="text-emerald-400">Legitimate</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] ${
                              tx.actual_class === 1
                                ? "bg-red-900/40 text-red-300 border border-red-700/50"
                                : "bg-slate-800 text-slate-300"
                            }`}
                          >
                            Class {tx.actual_class}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleInspect(tx)}
                            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-cyan-400 transition"
                            title="Inspect Features"
                          >
                            <ArrowUpRight className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        Simulation is currently stopped. Click "Start Stream" above to begin real-time fraud monitoring.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Breakdown Donut & Critical Alerts */}
        <div className="space-y-6">
          {/* Classification Breakdown Donut */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-md p-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
              Stream Decision Split
            </h3>
            {metrics.total_processed > 0 ? (
              <div className="h-44 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-44 flex items-center justify-center text-xs text-slate-500 text-center">
                Awaiting streaming transactions to render live distribution
              </div>
            )}
            <div className="flex justify-around text-xs text-slate-300 pt-2 border-t border-slate-800">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Legit: {metrics.predicted_legit_count}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                Fraud: {metrics.predicted_fraud_count}
              </span>
            </div>
          </div>

          {/* Recent Fraud Alerts Feed */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-md p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-red-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Critical Alerts
                </h3>
              </div>
              <span className="text-xs font-mono text-red-400">
                {status?.recent_alerts.length || 0} Intercepted
              </span>
            </div>

            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {status?.recent_alerts && status.recent_alerts.length > 0 ? (
                status.recent_alerts.slice(0, 4).map((alert) => (
                  <div
                    key={alert.alert_id}
                    className="rounded-xl border border-red-500/25 bg-red-950/20 p-3 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-red-400">
                        {alert.transaction_id}
                      </span>
                      <span className="text-[10px] text-slate-400">{alert.timestamp}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="font-mono text-white">${alert.amount.toFixed(2)}</span>
                      <span className="text-[11px] font-mono text-red-300">
                        Risk: {(alert.risk_score * 100).toFixed(1)}%
                      </span>
                    </div>
                    <p className="mt-1.5 text-[10px] text-slate-400 line-clamp-1">
                      {alert.reason}
                    </p>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-500">
                  No active fraud alerts detected.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Detail Modal */}
      {selectedTx && (
        <TransactionDetailModal
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
        />
      )}
    </div>
  );
};

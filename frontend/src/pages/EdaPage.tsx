import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Layers,
  Info,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { api } from "../services/api";
import { EdaSummary } from "../types";
import { LoadingSkeleton } from "../components/LoadingSkeleton";

export const EdaPage: React.FC = () => {
  const [eda, setEda] = useState<EdaSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getEdaSummary();
        setEda(res);
      } catch (err) {
        console.error("Failed to load EDA summary", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton rows={8} />
      </div>
    );
  }

  // Format Correlation Data for Recharts
  const correlationData = eda?.top_correlated_features
    ? Object.entries(eda.top_correlated_features).map(([name, value]) => ({
        feature: name,
        correlation: value,
        isNegative: value < 0,
      }))
    : [];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="border-b border-slate-800/80 pb-5">
        <h1 className="text-2xl font-black tracking-tight text-white">
          Exploratory Data Analysis (EDA) & Empirical Findings
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Statistical visual analysis and mathematical patterns across legitimate vs. fraudulent transactions.
        </p>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-[11px] uppercase font-mono text-slate-400">Class Imbalance</p>
          <p className="mt-1 text-xl font-bold font-mono text-red-400">
            {eda?.imbalance_ratio || "577 : 1"}
          </p>
          <span className="text-[10px] text-slate-500">Only 0.173% Fraudulent</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-[11px] uppercase font-mono text-slate-400">Time Horizon</p>
          <p className="mt-1 text-xl font-bold font-mono text-cyan-400">
            {eda?.time_span_hours || 48} Hours
          </p>
          <span className="text-[10px] text-slate-500">Continuous Logging</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-[11px] uppercase font-mono text-slate-400">Legit Median Amount</p>
          <p className="mt-1 text-xl font-bold font-mono text-emerald-400">
            ${eda?.amount_stats_legitimate.median.toFixed(2) || "22.00"}
          </p>
          <span className="text-[10px] text-slate-500">Mean: ${eda?.amount_stats_legitimate.mean.toFixed(2) || "88.29"}</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-[11px] uppercase font-mono text-slate-400">Fraud Median Amount</p>
          <p className="mt-1 text-xl font-bold font-mono text-red-400">
            ${eda?.amount_stats_fraudulent.median.toFixed(2) || "9.25"}
          </p>
          <span className="text-[10px] text-slate-500">Mean: ${eda?.amount_stats_fraudulent.mean.toFixed(2) || "122.21"}</span>
        </div>
      </div>

      {/* Visual Chart Section 1: Amount Distribution across Brackets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recharts: Amount Brackets and Fraud Rate */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Fraud Incident Rate Across Amount Brackets
              </h3>
              <p className="text-xs text-slate-400">
                Percentage of transactions flagged as fraud in each dollar tier
              </p>
            </div>
            <span className="rounded bg-cyan-950 px-2 py-0.5 text-[10px] font-mono text-cyan-300 border border-cyan-800">
              Interactive
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={eda?.amount_distribution_bins || []}>
                <XAxis dataKey="range" stroke="#64748b" fontSize={11} />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  unit="%"
                  domain={[0, "dataMax + 0.5"]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "8px",
                  }}
                  formatter={(val: any) => [`${Number(val).toFixed(3)}%`, "Fraud Rate"]}
                />
                <Bar dataKey="fraud_rate" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-[11px] text-slate-400 italic">
            Observed Pattern: Fraudsters frequently initiate small authorization probes ($0-$5) before attempting larger illicit withdrawals.
          </p>
        </div>

        {/* Recharts: Top Correlated Features */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Feature Correlation with Class (Pearson r)
              </h3>
              <p className="text-xs text-slate-400">
                Top negative (inverse) vs positive predictors of fraud
              </p>
            </div>
            <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">
              10 Features
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={correlationData} layout="vertical">
                <XAxis type="number" stroke="#64748b" fontSize={11} domain={[-0.35, 0.2]} />
                <YAxis dataKey="feature" type="category" stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "8px",
                  }}
                  formatter={(val: any) => [Number(val).toFixed(4), "Correlation"]}
                />
                <Bar dataKey="correlation" radius={[0, 4, 4, 0]}>
                  {correlationData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isNegative ? "#ef4444" : "#06b6d4"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-[11px] text-slate-400 italic">
            Features V14 (r = -0.30) and V12 (r = -0.26) exhibit the strongest inverse separation power against fraudulent actions.
          </p>
        </div>
      </div>

      {/* Academic Inferences & Detailed Findings Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
          <FileText className="h-4 w-4 text-cyan-400" />
          <span>Curated Empirical Inferences for Viva & Evaluation</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {eda?.key_insights.map((insight, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-4 text-xs text-slate-300 space-y-1"
            >
              <div className="flex items-center gap-2 font-bold text-cyan-300">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                <span>Finding #{idx + 1}</span>
              </div>
              <p className="text-slate-300 leading-relaxed">{insight}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Static High-Resolution Saved Plots from Pipeline */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-2">
          Pipeline Generated Visualizations (Matplotlib / Seaborn)
        </h3>
        <p className="text-xs text-slate-400 mb-6">
          High-resolution plots rendered directly during the ml/eda.py pipeline run.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950">
            <div className="p-3 border-b border-slate-800 text-xs font-semibold text-slate-300">
              Class Distribution (Log Scale)
            </div>
            <img
              src="http://127.0.0.1:5000/api/eda/plots/class_distribution.png"
              alt="Class Distribution"
              className="w-full h-auto object-cover"
              onError={(e: any) => {
                e.target.style.display = "none";
              }}
            />
          </div>

          <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950">
            <div className="p-3 border-b border-slate-800 text-xs font-semibold text-slate-300">
              Amount Distribution KDE
            </div>
            <img
              src="http://127.0.0.1:5000/api/eda/plots/amount_distribution.png"
              alt="Amount Distribution"
              className="w-full h-auto object-cover"
              onError={(e: any) => {
                e.target.style.display = "none";
              }}
            />
          </div>

          <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950">
            <div className="p-3 border-b border-slate-800 text-xs font-semibold text-slate-300">
              Top 10 Feature Correlations
            </div>
            <img
              src="http://127.0.0.1:5000/api/eda/plots/correlation_summary.png"
              alt="Correlation Summary"
              className="w-full h-auto object-cover"
              onError={(e: any) => {
                e.target.style.display = "none";
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

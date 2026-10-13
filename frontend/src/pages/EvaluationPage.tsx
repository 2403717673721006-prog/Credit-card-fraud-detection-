import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";
import {
  Cpu,
  Award,
  CheckCircle,
  AlertTriangle,
  Info,
  TrendingUp,
  Target,
  Clock,
  Layers,
} from "lucide-react";
import { api } from "../services/api";
import { ModelComparisonResponse, ModelMetrics } from "../types";
import { LoadingSkeleton } from "../components/LoadingSkeleton";

export const EvaluationPage: React.FC = () => {
  const [data, setData] = useState<ModelComparisonResponse | null>(null);
  const [activeModel, setActiveModel] = useState<string>("Random Forest");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getModelComparison();
        setData(res);
        if (res.selected_model) {
          setActiveModel(res.selected_model);
        }
      } catch (err) {
        console.error("Failed to load model evaluation metrics", err);
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

  const models = data?.models || {};
  const currentModelMetrics: ModelMetrics | undefined = models[activeModel];

  // Format data for comparative metrics bar chart
  const comparisonBarData = Object.keys(models).map((key) => {
    const m = models[key];
    return {
      name: key,
      Precision: Number((m.precision * 100).toFixed(1)),
      Recall: Number((m.recall * 100).toFixed(1)),
      F1: Number((m.f1_score * 100).toFixed(1)),
      "PR-AUC": Number((m.average_precision * 100).toFixed(1)),
    };
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="border-b border-slate-800/80 pb-5">
        <h1 className="text-2xl font-black tracking-tight text-white">
          Machine Learning Model Evaluation & Comparative Benchmark
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Rigorous test-split evaluation across 4 classification algorithms (56,962 untouched test transactions).
        </p>
      </div>

      {/* Model Selection Champion Banner */}
      <div className="rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/40 to-teal-950/20 p-5 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-cyan-500/20 p-3 text-cyan-400 border border-cyan-500/40">
            <Award className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
                Selected Champion Algorithm
              </span>
              <span className="rounded bg-cyan-900/80 px-2 py-0.5 text-[10px] font-mono text-cyan-200">
                Top PR-AUC
              </span>
            </div>
            <h2 className="text-xl font-black text-white mt-0.5">
              {data?.selected_model || "Random Forest"}
            </h2>
            <p className="mt-1 max-w-2xl text-xs text-slate-300">
              {data?.selection_rationale}
            </p>
          </div>
        </div>

        <div className="flex md:flex-col gap-3 font-mono text-right shrink-0">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Average Precision</span>
            <span className="text-xl font-bold text-cyan-400">
              {models[data?.selected_model || "Random Forest"]?.average_precision.toFixed(4) || "0.8444"}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">F1-Score</span>
            <span className="text-base font-bold text-emerald-400">
              {models[data?.selected_model || "Random Forest"]?.f1_score.toFixed(4) || "0.8039"}
            </span>
          </div>
        </div>
      </div>

      {/* Full Comparison Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-2">
          <Cpu className="h-4 w-4 text-cyan-400" />
          <span>Cross-Model Evaluation Matrix (56,962 Test Transactions)</span>
        </h3>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-3">Algorithm</th>
                <th className="py-3 px-3">Accuracy</th>
                <th className="py-3 px-3">Precision</th>
                <th className="py-3 px-3">Recall</th>
                <th className="py-3 px-3">F1-Score</th>
                <th className="py-3 px-3">PR-AUC (Avg Prec)</th>
                <th className="py-3 px-3">False Positives (FP)</th>
                <th className="py-3 px-3">False Negatives (FN)</th>
                <th className="py-3 px-3">Train Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {Object.keys(models).map((name) => {
                const m = models[name];
                const isSelected = name === data?.selected_model;
                return (
                  <tr
                    key={name}
                    onClick={() => setActiveModel(name)}
                    className={`cursor-pointer transition hover:bg-slate-800/40 ${
                      isSelected
                        ? "bg-cyan-950/20 font-semibold text-white border-l-2 border-cyan-400"
                        : ""
                    }`}
                  >
                    <td className="py-3 px-3 flex items-center gap-2 font-bold">
                      {isSelected && <Award className="h-3.5 w-3.5 text-cyan-400" />}
                      <span>{name}</span>
                    </td>
                    <td className="py-3 px-3">{(m.accuracy * 100).toFixed(2)}%</td>
                    <td className="py-3 px-3">
                      <span className={m.precision > 0.5 ? "text-emerald-400 font-bold" : "text-amber-400"}>
                        {(m.precision * 100).toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-cyan-300 font-bold">
                        {(m.recall * 100).toFixed(2)}%
                      </span>
                      <span className="text-[10px] text-slate-400 block font-normal">
                        ({m.tp}/{m.tp + m.fn} frauds)
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-white">{m.f1_score.toFixed(4)}</td>
                    <td className="py-3 px-3 font-bold text-cyan-400">
                      {m.average_precision.toFixed(4)}
                    </td>
                    <td className="py-3 px-3">
                      <span className={m.fp > 500 ? "text-red-400 font-bold" : "text-slate-300"}>
                        {m.fp.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={m.fn > 15 ? "text-amber-400" : "text-emerald-400"}>
                        {m.fn.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-sans text-[11px]">
                      {m.training_time_seconds.toFixed(2)}s
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Critical Machine Learning Warning Banner: The Accuracy Paradox */}
      <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-5 backdrop-blur-md flex items-start gap-3.5">
        <AlertTriangle className="h-6 w-6 shrink-0 text-amber-400 mt-0.5" />
        <div className="text-xs text-amber-200/90 space-y-1.5">
          <h4 className="font-bold text-amber-300 text-sm">
            Core Viva Takeaway: The Accuracy Paradox in Highly Imbalanced Fraud Domains
          </h4>
          <p>
            Notice that <strong className="text-white">Logistic Regression</strong> achieves a seemingly brilliant{" "}
            <span className="font-mono text-white">97.55% accuracy</span>. However, when examining Precision, it is only{" "}
            <span className="font-mono text-red-300 font-bold">6.09%</span>, incorrectly intercepting{" "}
            <span className="font-mono text-red-300 font-bold">1,388 legitimate transactions</span> (false alarms) to catch 90 fraud cases.
          </p>
          <p>
            In contrast, <strong className="text-white">Random Forest</strong> achieves an F1-Score of{" "}
            <span className="font-mono text-emerald-300 font-bold">0.8039</span> and Precision of{" "}
            <span className="font-mono text-emerald-300 font-bold">77.36%</span>, slashing false alarms from 1,388 down to just{" "}
            <span className="font-mono text-emerald-300 font-bold">24</span> across 56,864 genuine transactions.
          </p>
        </div>
      </div>

      {/* Comparative Charts & Confusion Matrix for Selected Model */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Comparative Barchart */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4">
            Benchmark Metric Comparison Across Algorithms (%)
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonBarData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar dataKey="Precision" fill="#38bdf8" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Recall" fill="#34d399" radius={[3, 3, 0, 0]} />
                <Bar dataKey="F1" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                <Bar dataKey="PR-AUC" fill="#a855f7" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Selected Model Confusion Matrix Inspector */}
        {currentModelMetrics && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Confusion Matrix: {activeModel}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Evaluated against 56,962 test set transactions (98 Fraud, 56,864 Legit)
                  </p>
                </div>
                <span className="rounded bg-slate-800 px-2 py-1 text-xs font-mono text-cyan-300">
                  Select row above to switch
                </span>
              </div>

              {/* 2x2 Heatmap Matrix Grid */}
              <div className="grid grid-cols-2 gap-3 max-w-md mx-auto my-4 font-mono text-center">
                {/* True Negatives */}
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
                  <span className="text-[10px] text-slate-400 uppercase block">
                    True Negatives (TN)
                  </span>
                  <span className="text-xl font-bold text-emerald-400">
                    {currentModelMetrics.tn.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Legit correctly passed
                  </span>
                </div>

                {/* False Positives */}
                <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-4">
                  <span className="text-[10px] text-slate-400 uppercase block">
                    False Positives (FP)
                  </span>
                  <span className="text-xl font-bold text-red-400">
                    {currentModelMetrics.fp.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    False customer alarms
                  </span>
                </div>

                {/* False Negatives */}
                <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4">
                  <span className="text-[10px] text-slate-400 uppercase block">
                    False Negatives (FN)
                  </span>
                  <span className="text-xl font-bold text-amber-400">
                    {currentModelMetrics.fn.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Missed fraud breaches
                  </span>
                </div>

                {/* True Positives */}
                <div className="rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4">
                  <span className="text-[10px] text-slate-400 uppercase block">
                    True Positives (TP)
                  </span>
                  <span className="text-xl font-bold text-cyan-400">
                    {currentModelMetrics.tp.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Fraud cases intercepted
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3 text-xs text-slate-400 flex justify-between">
              <span>Recall: {(currentModelMetrics.recall * 100).toFixed(1)}%</span>
              <span>Precision: {(currentModelMetrics.precision * 100).toFixed(1)}%</span>
              <span>ROC-AUC: {currentModelMetrics.roc_auc.toFixed(4)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

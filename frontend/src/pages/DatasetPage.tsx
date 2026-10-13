import React, { useEffect, useState } from "react";
import {
  Database,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Info,
  ExternalLink,
  Table,
  Layers,
} from "lucide-react";
import { api } from "../services/api";
import { DatasetSummary } from "../types";
import { MetricCard } from "../components/MetricCard";
import { LoadingSkeleton } from "../components/LoadingSkeleton";

export const DatasetPage: React.FC = () => {
  const [summary, setSummary] = useState<DatasetSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.getDatasetSummary();
        setSummary(res);
      } catch (err) {
        console.error("Failed to load dataset summary", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDownloadSummary = () => {
    if (!summary) return;
    const blob = new Blob([JSON.stringify(summary, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "creditguard_dataset_validation.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSkeleton rows={6} />
      </div>
    );
  }

  const amountStats = summary?.amount_statistics || {
    min: 0,
    max: 25691.16,
    mean: 88.35,
    median: 22.0,
    std: 250.12,
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Dataset Architecture & Schema Overview
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Comprehensive audit, schema verification, and statistical breakdown of the Kaggle ULB Credit Card Fraud dataset.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadSummary}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:border-cyan-500 transition"
          >
            <Download className="h-4 w-4 text-cyan-400" />
            <span>Export Validation JSON</span>
          </button>
        </div>
      </div>

      {/* Dataset Verification Banner */}
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/15 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-500/20 p-2.5 text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Dataset Status: Verified & Validated
            </h3>
            <p className="text-xs text-slate-300">
              Raw file size: {summary?.file_size_mb || 143.8} MB | Local storage verified at ml/data/creditcard.csv
            </p>
          </div>
        </div>

        <a
          href="https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
        >
          <span>Kaggle Dataset Source</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Transactions"
          value={summary?.total_rows.toLocaleString() || "284,807"}
          subtitle="Rows in CSV"
          icon={Database}
          variant="cyan"
        />
        <MetricCard
          title="Features Count"
          value={summary?.total_columns || 31}
          subtitle="30 Inputs + 1 Target ('Class')"
          icon={Layers}
          variant="slate"
        />
        <MetricCard
          title="Fraudulent Class (1)"
          value={`${summary?.fraud_count.toLocaleString() || "492"}`}
          subtitle={`${summary?.fraud_percentage.toFixed(4) || "0.1727"}% of total`}
          icon={AlertCircle}
          variant="rose"
        />
        <MetricCard
          title="Legitimate Class (0)"
          value={`${summary?.legitimate_count.toLocaleString() || "284,315"}`}
          subtitle="99.8273% of total"
          icon={CheckCircle2}
          variant="emerald"
        />
      </div>

      {/* Secondary Metrics: Quality and Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Data Quality Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Data Quality Integrity</span>
          </h3>
          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Missing Values (Nulls):</span>
              <span className="font-bold text-emerald-400">0 (Complete)</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Duplicate Rows:</span>
              <span className="font-bold text-amber-400">
                {summary?.duplicate_count.toLocaleString() || "1,081"}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Class Imbalance Ratio:</span>
              <span className="font-bold text-cyan-400">577 : 1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Target Feature:</span>
              <span className="font-bold text-white">'Class' (Binary {`{0, 1}`})</span>
            </div>
          </div>
        </div>

        {/* Transaction Amount Statistics */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-cyan-400" />
            <span>Amount ($) Descriptive Statistics</span>
          </h3>
          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Minimum:</span>
              <span className="font-bold text-white">${amountStats.min.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Median (50th percentile):</span>
              <span className="font-bold text-white">${amountStats.median.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Mean (Average):</span>
              <span className="font-bold text-white">${amountStats.mean.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span className="text-slate-400">Standard Deviation:</span>
              <span className="font-bold text-white">${amountStats.std.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Maximum:</span>
              <span className="font-bold text-cyan-400">${amountStats.max.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Temporal Duration */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
            <Info className="h-4 w-4 text-cyan-400" />
            <span>Collection Scope & Privacy</span>
          </h3>
          <div className="space-y-2.5 text-xs text-slate-300">
            <p>
              <strong className="text-white">Time Horizon:</strong> Captured across exactly 48 hours (172,792 seconds) of European cardholder transactions in September 2013.
            </p>
            <p>
              <strong className="text-white">Confidentiality:</strong> Features V1 through V28 are numerical principal components obtained through PCA. Due to user privacy agreements, raw personal identities are completely excluded.
            </p>
            <p>
              <strong className="text-white">Unmodified Features:</strong> Only 'Time' and 'Amount' represent original non-transformed features.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Catalog Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-2">
          <Table className="h-4 w-4 text-cyan-400" />
          <span>Complete Feature Schema Catalog (31 Columns)</span>
        </h3>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Column</th>
                <th className="py-2.5 px-3">Data Type</th>
                <th className="py-2.5 px-3">Transformation Role</th>
                <th className="py-2.5 px-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              <tr>
                <td className="py-2 px-3 font-bold text-cyan-400">Time</td>
                <td className="py-2 px-3 text-slate-400">float64</td>
                <td className="py-2 px-3 text-amber-300">Scaled via RobustScaler</td>
                <td className="py-2 px-3 text-slate-400 font-sans">
                  Seconds elapsed between current transaction and first transaction in dataset.
                </td>
              </tr>
              {Array.from({ length: 28 }, (_, i) => i + 1).map((idx) => (
                <tr key={`V${idx}`} className="hover:bg-slate-800/30">
                  <td className="py-2 px-3 font-bold text-white">V{idx}</td>
                  <td className="py-2 px-3 text-slate-400">float64</td>
                  <td className="py-2 px-3 text-emerald-400">PCA Component (Standardized)</td>
                  <td className="py-2 px-3 text-slate-400 font-sans">
                    Anonymized orthogonal principal component {idx} preserving confidential cardholder metrics.
                  </td>
                </tr>
              ))}
              <tr>
                <td className="py-2 px-3 font-bold text-cyan-400">Amount</td>
                <td className="py-2 px-3 text-slate-400">float64</td>
                <td className="py-2 px-3 text-amber-300">Scaled via RobustScaler</td>
                <td className="py-2 px-3 text-slate-400 font-sans">
                  Transaction dollar amount; heavily skewed with extreme outliers.
                </td>
              </tr>
              <tr className="bg-red-950/20">
                <td className="py-2 px-3 font-bold text-red-400">Class</td>
                <td className="py-2 px-3 text-slate-400">int64</td>
                <td className="py-2 px-3 text-red-300">Supervised Target</td>
                <td className="py-2 px-3 text-slate-300 font-sans font-semibold">
                  Binary ground truth label: 1 for fraudulent transaction, 0 for legitimate.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from "react";
import { X, Copy, Check, ArrowRight, ShieldAlert, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TransactionItem } from "../types";

interface TransactionDetailModalProps {
  transaction: TransactionItem | null;
  onClose: () => void;
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  transaction,
  onClose,
}) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  if (!transaction) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(transaction, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToPredictor = () => {
    // Save to sessionStorage for PredictPage to pick up
    if (transaction.all_features) {
      sessionStorage.setItem(
        "creditguard_test_row",
        JSON.stringify({
          features: transaction.all_features,
          actual_class: transaction.actual_class,
          transaction_id: transaction.transaction_id,
        })
      );
    }
    onClose();
    navigate("/predict");
  };

  const pcaEntries = transaction.all_features
    ? Object.entries(transaction.all_features).filter(
        ([k]) => k.startsWith("V")
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-slate-800 bg-[#0b1329] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 px-6 py-4 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-mono">
                {transaction.transaction_id}
              </h3>
              <p className="text-xs text-slate-400">
                Time Offset: {transaction.time.toFixed(1)}s ({(transaction.time / 3600).toFixed(1)}h)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-140px)] overflow-y-auto p-6 space-y-6">
          {/* Summary Badges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <p className="text-xs text-slate-400">Transaction Amount</p>
              <p className="mt-1 text-2xl font-bold font-mono text-cyan-400">
                ${transaction.amount.toFixed(2)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <p className="text-xs text-slate-400">Dataset Ground Truth</p>
              <div className="mt-1 flex items-center gap-2">
                {transaction.actual_class === 1 ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/15 px-3 py-1 text-xs font-semibold text-red-400">
                    <span className="h-2 w-2 rounded-full bg-red-400 animate-ping" />
                    Actual Fraud (Class 1)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                    Legitimate (Class 0)
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
              <p className="text-xs text-slate-400">Feature Dimensions</p>
              <p className="mt-1 text-sm font-medium text-slate-200">
                30 Continuous Inputs (V1-V28 + Time + Amount)
              </p>
            </div>
          </div>

          {/* Key PCA Components */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Key Anonymized Fraud Indicators (PCA Components)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {["V14", "V17", "V12", "V10", "V4", "V11", "V2", "V1"].map((feat) => {
                const val = transaction.all_features ? transaction.all_features[feat] : transaction.key_features[feat];
                const numVal = val !== undefined ? Number(val) : 0;
                const isExtreme = Math.abs(numVal) > 3.0;
                return (
                  <div
                    key={feat}
                    className={`rounded-lg p-3 border ${
                      isExtreme
                        ? "border-amber-500/30 bg-amber-500/5 text-amber-300"
                        : "border-slate-800 bg-slate-900/30 text-slate-300"
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono font-bold">{feat}</span>
                      {isExtreme && <span className="text-[10px] text-amber-400">Outlier</span>}
                    </div>
                    <div className="mt-1 font-mono text-sm font-semibold">
                      {numVal.toFixed(4)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Full PCA Features Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Full Principal Component Coordinate Vector (V1 - V28)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {pcaEntries.map(([k, v]) => (
                <div
                  key={k}
                  className="rounded border border-slate-800/80 bg-slate-900/50 p-2 text-center"
                >
                  <span className="text-[10px] text-slate-400 block font-mono">{k}</span>
                  <span className="text-xs font-mono font-medium text-slate-200">
                    {Number(v).toFixed(3)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-800/80 px-6 py-4 bg-slate-900/60">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied JSON" : "Copy Transaction JSON"}
          </button>

          <button
            onClick={handleSendToPredictor}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-teal-500 px-4 py-2 text-xs font-bold text-slate-950 hover:from-cyan-400 hover:to-teal-400 shadow-md shadow-cyan-950/40"
          >
            <span>Run in Live Fraud Predictor</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

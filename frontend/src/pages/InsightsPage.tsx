import React from "react";
import {
  TrendingUp,
  ShieldCheck,
  AlertOctagon,
  Scale,
  SlidersHorizontal,
  Server,
  FileQuestion,
  Lightbulb,
} from "lucide-react";

export const InsightsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="border-b border-slate-800/80 pb-5">
        <h1 className="text-2xl font-black tracking-tight text-white">
          Empirical Business Insights & Institutional Trade-offs
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Translating machine learning metrics into financial organization decisions, friction trade-offs, and operational guardrails.
        </p>
      </div>

      {/* Hero Insight Summary */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-cyan-500/10 p-3 text-cyan-400">
            <Scale className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              The Dual Costs of Financial Fraud Prevention
            </h2>
            <p className="mt-1 text-xs text-slate-300 leading-relaxed max-w-4xl">
              In real financial institutions, fraud detection is fundamentally an economic optimization problem between two competing costs:{" "}
              <strong className="text-cyan-400">Direct Fraud Losses</strong> (from Missed Frauds / False Negatives) and{" "}
              <strong className="text-amber-400">Customer Friction & Churn</strong> (from False Declines / False Positives). Our experimental results quantitatively demonstrate this exact dynamic.
            </p>
          </div>
        </div>
      </div>

      {/* Empirical Evidence Grid: 4 Core Experiments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Insight 1: Interception Performance */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4" />
            <span>Finding 1: High-Volume Fraud Interception</span>
          </div>
          <h3 className="text-sm font-bold text-white">
            83.67% of Fraud Attacks Intercepted by Random Forest
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            In our untouched test partition of 56,962 transactions, the trained Random Forest classifier intercepted{" "}
            <strong className="text-white">82 out of 98 fraudulent transactions</strong>, despite fraud representing only 0.17% of total network traffic.
          </p>
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs font-mono text-slate-400">
            <div className="flex justify-between">
              <span>Actual Fraud Cases in Test Set:</span>
              <span className="text-white font-bold">98</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Successfully Caught (True Positives):</span>
              <span className="text-emerald-400 font-bold">82 (83.7%)</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Missed Breaches (False Negatives):</span>
              <span className="text-amber-400 font-bold">16 (16.3%)</span>
            </div>
          </div>
        </div>

        {/* Insight 2: False Positive Containment */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
            <TrendingUp className="h-4 w-4" />
            <span>Finding 2: False Positive Containment</span>
          </div>
          <h3 className="text-sm font-bold text-white">
            Only 24 Legitimate Cardholders Interrupted (99.96% Specificity)
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            While basic Logistic Regression interrupted 1,388 legitimate cardholders with false alarms, Random Forest generated only{" "}
            <strong className="text-white">24 false positives out of 56,864 genuine transactions</strong>. This represents a false positive rate of just{" "}
            <span className="text-emerald-400 font-mono font-bold">0.042%</span>, protecting the cardholder checkout experience.
          </p>
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs font-mono text-slate-400">
            <div className="flex justify-between">
              <span>Total Legitimate Transactions Evaluated:</span>
              <span className="text-white font-bold">56,864</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Logistic Regression False Alarms:</span>
              <span className="text-red-400 font-bold">1,388 (2.44%)</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Random Forest False Alarms:</span>
              <span className="text-emerald-400 font-bold">24 (0.04%)</span>
            </div>
          </div>
        </div>

        {/* Insight 3: Dynamic Threshold Tuning */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <SlidersHorizontal className="h-4 w-4" />
            <span>Finding 3: Configurable Decision Thresholds</span>
          </div>
          <h3 className="text-sm font-bold text-white">
            Default 0.5 Threshold Must Be Tuned to Business Risk Appetite
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Machine learning output probabilities reflect statistical ranking, not literal absolute percentages. By adjusting the decision threshold:
          </p>
          <ul className="text-xs text-slate-300 space-y-2 pl-4 list-disc">
            <li>
              <strong className="text-white">Threshold = 0.30 (Aggressive Defense):</strong> Increases Recall to ~90%, capturing elusive micro-frauds, but raises false customer interventions.
            </li>
            <li>
              <strong className="text-white">Threshold = 0.70 (Frictionless Checkout):</strong> Elevates Precision to &gt;88%, minimizing cardholder complaints during peak shopping seasons (e.g., Black Friday).
            </li>
          </ul>
        </div>

        {/* Insight 4: Why 16 Frauds Slipped Through */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md space-y-3">
          <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider">
            <AlertOctagon className="h-4 w-4" />
            <span>Finding 4: Error Analysis on Missed Frauds</span>
          </div>
          <h3 className="text-sm font-bold text-white">
            Anatomical Characteristics of False Negatives (Missed Frauds)
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Examining the 16 missed fraudulent transactions revealed that they had amounts closely matching typical legitimate spending ($1.00 to $45.00) and PCA coordinates near the center of the legitimate distribution.
          </p>
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-400">
            <p className="italic text-slate-300">
              Conclusion: Single-transaction classifiers alone cannot detect sophisticated mimicry attacks. Production environments require behavioral velocity counters and temporal user baselines.
            </p>
          </div>
        </div>
      </div>

      {/* Production Architecture Recommendations */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
          <Server className="h-4 w-4 text-cyan-400" />
          <span>Architectural Recommendations for Production-Grade Deployment</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-xs space-y-2">
            <h4 className="font-bold text-cyan-300">1. Tiered Review Architecture</h4>
            <p className="text-slate-400 leading-relaxed">
              Instead of binary Approve/Decline, implement a 3-tier system: Automatic Approve (Risk &lt; 20%), Step-Up Challenge with OTP/Biometrics (Risk 20%-75%), and Automatic Decline (Risk &gt; 75%).
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-xs space-y-2">
            <h4 className="font-bold text-cyan-300">2. Velocity & State Management</h4>
            <p className="text-slate-400 leading-relaxed">
              Maintain sliding-window Redis aggregates tracking rapid-fire transaction counts (e.g. 5 attempts in 60 seconds) and geolocation jumps (impossible travel detection).
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-xs space-y-2">
            <h4 className="font-bold text-cyan-300">3. Continuous Concept Drift Retraining</h4>
            <p className="text-slate-400 leading-relaxed">
              Fraud patterns evolve rapidly. Retrain weekly on newly confirmed chargeback labels using MLflow or automated shadow pipelines to prevent concept drift.
            </p>
          </div>
        </div>
      </div>

      {/* Research Limitations Banner */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 flex items-start gap-3 text-xs text-slate-400">
        <FileQuestion className="h-5 w-5 shrink-0 text-slate-400 mt-0.5" />
        <div>
          <strong className="text-slate-300">Academic Dataset Scope & Limitations:</strong>{" "}
          This study is based on the 2013 ULB creditcardfraud dataset. In commercial deployments, feature sets include real device fingerprints, IP reputation, merchant category codes (MCC), cardholder billing countries, and behavioral biometrics, which further enhance detection accuracy.
        </div>
      </div>
    </div>
  );
};

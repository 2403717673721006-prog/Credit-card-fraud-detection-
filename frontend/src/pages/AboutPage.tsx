import React from "react";
import {
  Info,
  GraduationCap,
  Target,
  Layers,
  Code2,
  Database,
  ShieldAlert,
  GitBranch,
  FileCheck,
  CheckCircle2,
} from "lucide-react";

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="border-b border-slate-800/80 pb-5">
        <h1 className="text-2xl font-black tracking-tight text-white">
          Project Information & Academic Specifications
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Course requirements, system methodology, literature background, and technical documentation.
        </p>
      </div>

      {/* Course Metadata Banner */}
      <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 to-slate-900/60 p-6 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-cyan-500/20 p-3.5 text-cyan-400 border border-cyan-500/30">
            <GraduationCap className="h-8 w-8" />
          </div>
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
              Course: 22MDC56 Machine Learning Laboratory
            </span>
            <h2 className="text-xl font-black text-white mt-0.5">
              CreditGuard — Real-Time Fraud Monitoring & Detection
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              An end-to-end applied machine learning system combining severe class-imbalance preprocessing, benchmark model evaluation, RESTful inference APIs, and interactive transaction stream simulation.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-right font-mono text-xs text-slate-300 shrink-0">
          <p className="text-[10px] text-slate-500 uppercase">Evaluation Structure</p>
          <p className="font-bold text-cyan-400 mt-0.5">8 Rubric Components</p>
          <p className="text-[10px] text-emerald-400">Total Marks: 40 Marks</p>
        </div>
      </div>

      {/* Problem Statement & Objectives Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Problem Statement */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <Target className="h-4 w-4 text-cyan-400" />
            <span>Problem Statement</span>
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Financial credit card fraud results in billions of dollars in annual global losses. However, fraudulent activity constitutes an extreme minority of overall electronic transactions (less than 0.2%).
          </p>
          <p className="text-xs text-slate-300 leading-relaxed">
            Standard classification algorithms biased toward majority classes suffer from the <strong className="text-white">Accuracy Paradox</strong>, scoring 99.8% accuracy while failing to intercept actual fraud. Simultaneously, aggressive heuristics generate excessive false declines that alienate legitimate cardholders.
          </p>
        </div>

        {/* Project Objectives */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Core Objectives</span>
          </h3>
          <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4">
            <li>
              Implement leak-free preprocessing with <strong className="text-white">RobustScaler</strong> and stratified splitting to prevent evaluation bias.
            </li>
            <li>
              Train and systematically benchmark 4 algorithms: Logistic Regression, Decision Trees, Random Forest, and K-Nearest Neighbors.
            </li>
            <li>
              Prioritize <strong className="text-cyan-400">Average Precision (PR-AUC)</strong> and <strong className="text-emerald-400">F1-Score</strong> over raw accuracy.
            </li>
            <li>
              Deliver an interactive real-time simulation dashboard with live feature inspection and configurable decision thresholds.
            </li>
          </ul>
        </div>
      </div>

      {/* Methodology Architecture Pipeline */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
          <Layers className="h-4 w-4 text-cyan-400" />
          <span>Proposed System Methodology Pipeline</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs space-y-2">
            <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">
              Phase 1
            </span>
            <h4 className="font-bold text-white">Acquisition & Schema Validation</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Automated fetching and verification of Kaggle ULB dataset. Schema validation ensures 284,807 rows, 30 continuous inputs, and binary Class.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs space-y-2">
            <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">
              Phase 2
            </span>
            <h4 className="font-bold text-white">Leak-Free Scaling & Splitting</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Stratified 80/20 train-test partition. RobustScaler fitted strictly on training data for skewed Time and Amount, leaving PCA features intact.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs space-y-2">
            <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">
              Phase 3
            </span>
            <h4 className="font-bold text-white">Ensemble & Balanced Modeling</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Algorithmic class-weight balancing and neighborhood subsampling for KNN. Champion model selection ranked by PR-AUC.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs space-y-2">
            <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">
              Phase 4
            </span>
            <h4 className="font-bold text-white">REST API & Real-Time Monitoring</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Flask REST endpoints, SQLite prediction history, and React TypeScript dashboard simulating transaction streaming.
            </p>
          </div>
        </div>
      </div>

      {/* Technology Stack Grid */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
          <Code2 className="h-4 w-4 text-cyan-400" />
          <span>Technology Stack</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3.5 space-y-1">
            <span className="text-cyan-400 font-bold block">Frontend UI</span>
            <p className="text-white">React 18 + TypeScript</p>
            <p className="text-slate-400 text-[11px]">Vite, Tailwind CSS, Recharts, Lucide React, React Router</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3.5 space-y-1">
            <span className="text-emerald-400 font-bold block">Backend REST API</span>
            <p className="text-white">Python 3.14 + Flask</p>
            <p className="text-slate-400 text-[11px]">Flask-CORS, Joblib, Threading, SQLite3</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3.5 space-y-1">
            <span className="text-amber-400 font-bold block">Machine Learning</span>
            <p className="text-white">Scikit-Learn</p>
            <p className="text-slate-400 text-[11px]">Pandas, NumPy, Matplotlib, Seaborn, RobustScaler</p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-3.5 space-y-1">
            <span className="text-purple-400 font-bold block">Data & Persistence</span>
            <p className="text-white">CSV + SQLite3</p>
            <p className="text-slate-400 text-[11px]">284,807 transactions CSV, creditguard.sqlite3</p>
          </div>
        </div>
      </div>

      {/* Academic Disclaimer */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-xs text-slate-500 leading-relaxed flex items-start gap-3">
        <Info className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
        <div>
          <strong className="text-slate-400">Academic Laboratory Disclaimer:</strong> CreditGuard is an educational project developed exclusively for the 22MDC56 Machine Learning Laboratory course. This application demonstrates machine learning classification techniques on anonymized benchmark data and is not connected to a live banking clearing network or production card gateway.
        </div>
      </div>
    </div>
  );
};

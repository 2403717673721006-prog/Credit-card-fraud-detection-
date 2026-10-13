import React, { useEffect, useState } from "react";
import { ShieldCheck, Activity, Cpu, Database, AlertTriangle } from "lucide-react";
import { api } from "../services/api";
import { HealthStatus } from "../types";

export const Navbar: React.FC = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await api.getHealth();
        setHealth(res);
        setIsOnline(true);
      } catch {
        setIsOnline(false);
      }
    };
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-[#080d1a]/90 px-6 backdrop-blur-md">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 text-slate-950 shadow-md shadow-cyan-900/40">
          <ShieldCheck className="h-6 w-6 stroke-[2.2]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-white font-mono">
              Credit<span className="text-cyan-400">Guard</span>
            </span>
            <span className="rounded bg-cyan-950/80 border border-cyan-800/40 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-cyan-300">
              v2.0 ML Lab
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Real-Time Fraud Monitoring & Credit Card Fraud Detection System
          </p>
        </div>
      </div>

      {/* Course & System Status Badges */}
      <div className="flex items-center gap-3">
        {/* Course Badge */}
        <div className="hidden lg:flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-300">
          <span className="text-cyan-400 font-mono font-bold">22MDC56</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">Machine Learning Laboratory</span>
        </div>

        {/* Model Badge */}
        <div className="hidden sm:flex items-center gap-2 rounded-lg border border-cyan-900/30 bg-cyan-950/20 px-3 py-1.5 text-xs text-cyan-300">
          <Cpu className="h-3.5 w-3.5 text-cyan-400" />
          <span className="font-medium">Active: Random Forest</span>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-900/50 px-1 rounded">
            PR-AUC 0.844
          </span>
        </div>

        {/* Live Connectivity Pulse */}
        <div
          className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium ${
            isOnline
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border-red-500/30 bg-red-500/10 text-red-400"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isOnline ? "bg-emerald-400 animate-ping" : "bg-red-400"
            }`}
          />
          <span>{isOnline ? "API Engine Online" : "Backend Offline"}</span>
        </div>
      </div>
    </header>
  );
};

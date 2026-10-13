import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Activity,
  ShieldAlert,
  Database,
  BarChart3,
  Cpu,
  TrendingUp,
  Info,
} from "lucide-react";

const navItems = [
  {
    name: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
    badge: "Live",
  },
  {
    name: "Transaction Monitoring",
    path: "/transactions",
    icon: Activity,
    badge: "284k",
  },
  {
    name: "Fraud Prediction Tool",
    path: "/predict",
    icon: ShieldAlert,
    badge: "Inference",
  },
  {
    name: "Dataset Overview",
    path: "/dataset",
    icon: Database,
  },
  {
    name: "Exploratory Analysis",
    path: "/eda",
    icon: BarChart3,
  },
  {
    name: "Model Evaluation",
    path: "/evaluation",
    icon: Cpu,
    badge: "4 Models",
  },
  {
    name: "Business Insights",
    path: "/insights",
    icon: TrendingUp,
  },
  {
    name: "Project Information",
    path: "/about",
    icon: Info,
  },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 shrink-0 border-r border-slate-800 bg-[#080d1a] p-4 flex flex-col justify-between hidden md:flex">
      <div>
        <div className="mb-4 px-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Navigation Menu
          </p>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-500/15 to-teal-500/10 text-cyan-400 border border-cyan-500/30 font-semibold"
                      : "text-slate-400 hover:bg-slate-900/60 hover:text-slate-200"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="rounded bg-slate-800/80 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-700/50">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Info Box */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3.5 text-[11px] text-slate-400 space-y-1">
        <p className="font-semibold text-slate-300">Course Laboratory</p>
        <p className="text-slate-400">22MDC56 ML Lab</p>
        <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
          Dataset: Kaggle ULB Credit Card
        </p>
      </div>
    </aside>
  );
};

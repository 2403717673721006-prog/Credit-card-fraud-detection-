import React from "react";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "cyan" | "emerald" | "rose" | "amber" | "slate";
  trend?: string;
  trendPositive?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "cyan",
  trend,
  trendPositive,
}) => {
  const variantStyles = {
    cyan: {
      border: "border-cyan-500/20 hover:border-cyan-500/40",
      iconBg: "bg-cyan-500/10 text-cyan-400",
      accent: "text-cyan-400",
    },
    emerald: {
      border: "border-emerald-500/20 hover:border-emerald-500/40",
      iconBg: "bg-emerald-500/10 text-emerald-400",
      accent: "text-emerald-400",
    },
    rose: {
      border: "border-rose-500/20 hover:border-rose-500/40",
      iconBg: "bg-rose-500/10 text-rose-400",
      accent: "text-rose-400",
    },
    amber: {
      border: "border-amber-500/20 hover:border-amber-500/40",
      iconBg: "bg-amber-500/10 text-amber-400",
      accent: "text-amber-400",
    },
    slate: {
      border: "border-slate-800 hover:border-slate-700",
      iconBg: "bg-slate-800 text-slate-300",
      accent: "text-slate-200",
    },
  }[variant];

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-slate-900/70 p-5 backdrop-blur-md border ${variantStyles.border} transition-all duration-200 hover:shadow-lg hover:shadow-cyan-950/20`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {title}
        </p>
        <div className={`rounded-lg p-2.5 ${variantStyles.iconBg}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-3">
        <h3 className="text-2xl font-bold tracking-tight text-white font-mono">
          {value}
        </h3>
        {(subtitle || trend) && (
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
            {trend && (
              <span
                className={`font-semibold ${
                  trendPositive ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {trend}
              </span>
            )}
            {subtitle && <span>{subtitle}</span>}
          </div>
        )}
      </div>
    </div>
  );
};

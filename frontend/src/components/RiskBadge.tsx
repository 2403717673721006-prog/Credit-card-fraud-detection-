import React from "react";

interface RiskBadgeProps {
  score?: number;
  tier?: "LOW" | "MODERATE" | "HIGH" | "CRITICAL" | string;
  isAlert?: boolean;
  size?: "sm" | "md" | "lg";
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  score,
  tier,
  isAlert,
  size = "md",
}) => {
  let effectiveTier = tier;
  if (!effectiveTier && score !== undefined) {
    if (score < 0.2) effectiveTier = "LOW";
    else if (score < 0.5) effectiveTier = "MODERATE";
    else if (score < 0.8) effectiveTier = "HIGH";
    else effectiveTier = "CRITICAL";
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs font-mono",
    md: "px-2.5 py-1 text-xs font-medium",
    lg: "px-3.5 py-1.5 text-sm font-semibold",
  }[size];

  switch (effectiveTier) {
    case "CRITICAL":
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/15 text-red-400 ${sizeClasses}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-ping" />
          <span>Critical Fraud</span>
          {score !== undefined && <span className="opacity-80">({(score * 100).toFixed(1)}%)</span>}
        </span>
      );
    case "HIGH":
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/15 text-orange-400 ${sizeClasses}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
          <span>High Risk</span>
          {score !== undefined && <span className="opacity-80">({(score * 100).toFixed(1)}%)</span>}
        </span>
      );
    case "MODERATE":
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/15 text-amber-300 ${sizeClasses}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          <span>Moderate Caution</span>
          {score !== undefined && <span className="opacity-80">({(score * 100).toFixed(1)}%)</span>}
        </span>
      );
    case "LOW":
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 ${sizeClasses}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span>Legitimate</span>
          {score !== undefined && <span className="opacity-80">({(score * 100).toFixed(1)}%)</span>}
        </span>
      );
  }
};

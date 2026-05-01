"use client";

import { AlertTriangle, CheckCircle2, CircleDot, ShieldQuestion } from "lucide-react";

import { buildQualityFactors } from "@/lib/business-intelligence";
import { cn } from "@/lib/utils";

type DataQualityExplanationProps = {
  result: Record<string, any>;
};

const statusStyles = {
  good: {
    icon: CheckCircle2,
    className: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
  },
  watch: {
    icon: CircleDot,
    className: "text-amber-300 bg-amber-500/10 border-amber-500/20",
  },
  risk: {
    icon: AlertTriangle,
    className: "text-rose-300 bg-rose-500/10 border-rose-500/20",
  },
};

export function DataQualityExplanation({ result }: DataQualityExplanationProps) {
  const factors = buildQualityFactors(result);
  const score = result?.summary?.data_quality_score ?? result?.cleaning_report?.score_after ?? 0;

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-zinc-950/60 p-6 sm:p-8 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-3">
            <ShieldQuestion className="w-4 h-4 text-blue-400" />
            Data quality explanation
          </div>
          <h3 className="text-xl font-black text-white">How the quality score is interpreted</h3>
          <p className="mt-2 text-sm text-zinc-500 max-w-2xl leading-relaxed">
            The score rewards completeness and consistency, then penalizes missing values, duplicates, suspicious types, empty columns and outlier pressure.
          </p>
        </div>
        <div className="rounded-sm border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-center">
          <div className="text-[10px] font-black uppercase tracking-widest text-emerald-300">Current score</div>
          <div className="text-3xl font-black text-white mt-1">{score}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {factors.map((factor) => {
          const config = statusStyles[factor.status];
          const Icon = config.icon;
          return (
            <div key={factor.label} className="rounded-sm border border-zinc-900 bg-black/40 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-white">{factor.label}</div>
                  <div className="text-xl font-black text-zinc-200 mt-1">{factor.value}</div>
                </div>
                <div className={cn("rounded-full border p-1.5", config.className)}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed mt-3">{factor.explanation}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}


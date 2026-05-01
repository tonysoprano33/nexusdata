"use client";

import { AlertTriangle, ArrowRight, BadgeCheck, Lightbulb, Target } from "lucide-react";

import { buildBusinessRecommendations, type ConfidenceLevel } from "@/lib/business-intelligence";
import { cn } from "@/lib/utils";

type BusinessRecommendationsProps = {
  result: Record<string, any>;
};

const confidenceStyles: Record<ConfidenceLevel, string> = {
  High: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
  Medium: "text-amber-300 bg-amber-500/10 border-amber-500/20",
  Low: "text-rose-300 bg-rose-500/10 border-rose-500/20",
};

export function BusinessRecommendations({ result }: BusinessRecommendationsProps) {
  const recommendations = buildBusinessRecommendations(result);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/[0.07] bg-zinc-950/60 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-3">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              AI Business Recommendations
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight">
              So what should a business do next?
            </h3>
          </div>
          <p className="max-w-md text-sm text-zinc-500 leading-relaxed">
            Each card connects a finding to business impact, action and confidence so the dashboard feels decision-ready.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {recommendations.map((item, index) => (
            <article
              key={`${item.finding}-${index}`}
              className="rounded-sm border border-white/[0.06] bg-black/40 p-5 space-y-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-sm border border-amber-500/20 bg-amber-500/10 text-amber-300 flex items-center justify-center shrink-0">
                    <Target className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
                      Finding #{index + 1}
                    </div>
                    <h4 className="mt-1 text-sm font-bold text-white leading-snug">
                      {item.finding}
                    </h4>
                  </div>
                </div>
                <span className={cn("rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-widest shrink-0", confidenceStyles[item.confidence])}>
                  {item.confidence}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="rounded-sm bg-zinc-950/80 border border-zinc-900 p-4">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2">
                    <BadgeCheck className="w-3.5 h-3.5 text-blue-400" />
                    Why it matters
                  </div>
                  <p className="text-zinc-400 leading-relaxed">{item.whyItMatters}</p>
                </div>
                <div className="rounded-sm bg-zinc-950/80 border border-zinc-900 p-4">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-600 mb-2">
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                    Suggested action
                  </div>
                  <p className="text-zinc-300 leading-relaxed">{item.suggestedAction}</p>
                </div>
              </div>

              {item.warning && (
                <div className="flex items-start gap-2 rounded-sm border border-amber-500/15 bg-amber-500/[0.04] p-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-200/80 leading-relaxed">{item.warning}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}


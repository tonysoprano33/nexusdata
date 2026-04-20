"use client";
import { CheckCircle2, ShieldCheck, Zap, Database } from "lucide-react";

export function CleaningReport({ report }: { report: any }) {
  if (!report) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 bg-zinc-900/40 rounded-2xl border border-white/5">
      {/* Cleanup Percentage */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
          <Zap className="w-3 h-3 text-amber-400" /> Cleanup Ratio
        </div>
        <div className="text-4xl font-black text-white">{report.cleanup_percentage}%</div>
        <p className="text-xs text-zinc-500 font-medium">Dataset optimization complete.</p>
      </div>

      {/* Quality Gain */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
          <ShieldCheck className="w-3 h-3 text-emerald-400" /> Quality Integrity
        </div>
        <div className="text-4xl font-black text-white">{report.score_after}%</div>
        <p className="text-xs text-zinc-500 font-medium">From {report.score_before}% raw score.</p>
      </div>

      {/* Changes list */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
          <CheckCircle2 className="w-3 h-3 text-blue-400" /> Key Actions
        </div>
        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
          {report.actions?.map((action: string, i: number) => (
            <div key={i} className="flex gap-2 items-start text-xs text-zinc-300 font-medium">
              <div className="w-1 h-1 rounded-full bg-zinc-700 mt-1.5 shrink-0" />
              {action}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
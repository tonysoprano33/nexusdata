"use client";
import { CheckCircle2, ShieldCheck, Zap, Database, ArrowUp, Minus, AlertCircle, TrendingUp } from "lucide-react";

interface CleaningReportProps {
  report: any;
  statistics?: any;
}

export function CleaningReport({ report, statistics }: CleaningReportProps) {
  if (!report) return null;

  const improvement = report.improvement || (report.score_after - report.score_before);
  const rowsRemoved = report.rows_removed || 0;
  const originalRows = report.original_rows || 0;
  const finalRows = report.final_rows || 0;
  const changesMade = report.changes_made || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 bg-zinc-900/40 rounded-2xl border border-white/5">
      {/* Health Score Before → After */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
          <ShieldCheck className="w-3 h-3 text-rose-400" /> Health Score Before
        </div>
        <div className="text-3xl font-black text-rose-400">{report.score_before || 0}%</div>
        <p className="text-xs text-zinc-500 font-medium">Raw data quality</p>
      </div>

      {/* Health Score After */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
          <ShieldCheck className="w-3 h-3 text-emerald-400" /> Health Score After
        </div>
        <div className="text-3xl font-black text-emerald-400">{report.score_after || 0}%</div>
        <div className="flex items-center gap-1 text-xs text-emerald-400 font-bold">
          <TrendingUp className="w-3 h-3" />
          +{improvement.toFixed(1)}% improvement
        </div>
      </div>

      {/* Rows Removed */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
          <Minus className="w-3 h-3 text-amber-400" /> Rows Removed
        </div>
        <div className="text-3xl font-black text-white">{rowsRemoved}</div>
        <p className="text-xs text-zinc-500 font-medium">
          {originalRows.toLocaleString()} → {finalRows.toLocaleString()} rows
        </p>
      </div>

      {/* Data Reduction % */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
          <Zap className="w-3 h-3 text-blue-400" /> Cleanup Impact
        </div>
        <div className="text-3xl font-black text-blue-400">
          {originalRows > 0 ? ((rowsRemoved / originalRows) * 100).toFixed(1) : 0}%
        </div>
        <p className="text-xs text-zinc-500 font-medium">Data reduced</p>
      </div>

      {/* Changes Made - Full Width */}
      {changesMade.length > 0 && (
        <div className="col-span-full mt-4 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-3">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Cleaning Actions Applied
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {changesMade.map((action: string, i: number) => (
              <div key={i} className="flex gap-2 items-start text-xs text-zinc-300 font-medium p-2 rounded bg-zinc-800/50">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                {action}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

import { Download, FileCheck2, FileText, Gauge, Table2, Wrench } from "lucide-react";

import { buildExecutiveOverview, buildMarkdownReport } from "@/lib/business-intelligence";
import { cn } from "@/lib/utils";

type ExecutiveOverviewProps = {
  filename: string;
  result: Record<string, any>;
};

function MetricTile({
  label,
  value,
  icon: Icon,
  tone = "zinc",
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  tone?: "zinc" | "emerald" | "amber" | "blue";
}) {
  const tones = {
    zinc: "text-zinc-300 bg-zinc-900/70 border-zinc-800",
    emerald: "text-emerald-300 bg-emerald-500/10 border-emerald-500/20",
    amber: "text-amber-300 bg-amber-500/10 border-amber-500/20",
    blue: "text-blue-300 bg-blue-500/10 border-blue-500/20",
  };

  return (
    <div className={cn("rounded-sm border p-4 min-w-0", tones[tone])}>
      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <div className="mt-3 text-2xl font-black text-white truncate">{value}</div>
    </div>
  );
}

export function ExecutiveOverview({ filename, result }: ExecutiveOverviewProps) {
  const overview = buildExecutiveOverview(result, filename);

  const exportReport = () => {
    const markdown = buildMarkdownReport(result, filename);
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename.replace(/\.[^.]+$/, "") || "analysis"}-executive-report.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="rounded-2xl border border-white/[0.07] bg-zinc-950/70 overflow-hidden">
      <div className="p-6 sm:p-8 border-b border-white/[0.06] flex flex-col lg:flex-row gap-6 lg:items-start lg:justify-between">
        <div className="space-y-4 max-w-3xl">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">
            <FileCheck2 className="w-4 h-4 text-emerald-400" />
            Executive overview
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              What data did we analyze?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-zinc-400 leading-relaxed">
              {overview.datasetDescription}
            </p>
          </div>
        </div>

        <button
          onClick={exportReport}
          className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-sm bg-white text-black text-[11px] font-black uppercase tracking-widest hover:bg-zinc-200 active:scale-[0.98] transition-all"
        >
          <Download className="w-4 h-4" />
          Export Analysis Report
        </button>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <MetricTile label="Dataset" value={overview.datasetName} icon={FileText} />
          <MetricTile label="Rows" value={overview.rows.toLocaleString()} icon={Table2} tone="blue" />
          <MetricTile label="Columns" value={overview.columns.toLocaleString()} icon={Table2} />
          <MetricTile label="Quality" value={`${overview.qualityScore}%`} icon={Gauge} tone="emerald" />
          <MetricTile label="Issues / Fixes" value={`${overview.issuesDetected}/${overview.fixesApplied}`} icon={Wrench} tone="amber" />
        </div>

        <div className="rounded-sm border border-blue-500/15 bg-blue-500/[0.04] p-5">
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-300 mb-3">
            Executive summary
          </div>
          <p className="text-sm sm:text-base text-zinc-200 leading-relaxed">
            {overview.executiveSummary}
          </p>
        </div>
      </div>
    </section>
  );
}


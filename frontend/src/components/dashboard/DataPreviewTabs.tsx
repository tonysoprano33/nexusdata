"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, GitMerge, Columns, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "compare" | "raw" | "clean" | "diff" | "describe" | "info" | "top";

interface DiffChange {
  before: unknown;
  after: unknown;
}

interface DiffRow {
  row: number;
  changes: Record<string, DiffChange>;
  raw: Record<string, unknown>;
  clean: Record<string, unknown>;
}

interface DataPreviewTabsProps {
  rawPreview?: Record<string, unknown>[];
  cleanPreview?: Record<string, unknown>[];
  diffPreview?: DiffRow[];
  rawStats?: any;
  cleanStats?: any;
}

function cellStr(val: unknown): string {
  if (val === null || val === undefined) return "-";
  return String(val);
}

function PreviewTable({ data }: { data: Record<string, unknown>[] }) {
  if (!data || data.length === 0) {
    return <div className="py-10 text-center text-zinc-600">No data</div>;
  }
  const columns = Object.keys(data[0]);
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="border-b border-zinc-800">
            {columns.map(col => (
              <th key={col} className="text-left px-4 py-3 text-[10px] font-black uppercase text-zinc-500">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-zinc-900/50">
              {columns.map(col => (
                <td key={col} className="px-4 py-2 text-zinc-300 font-mono">{cellStr(row[col])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function HeadComparison({ raw = [], clean = [] }: { raw?: any[], clean?: any[] }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-px bg-white/[0.05]">
      <div className="bg-zinc-950 p-4">
        <h4 className="text-[10px] font-black uppercase text-rose-400 mb-4">Before (Original)</h4>
        <PreviewTable data={raw.slice(0, 5)} />
      </div>
      <div className="bg-zinc-950 p-4">
        <h4 className="text-[10px] font-black uppercase text-emerald-400 mb-4">After (Cleaned)</h4>
        <PreviewTable data={clean.slice(0, 5)} />
      </div>
    </div>
  );
}

// Generate diff between raw and clean data
function generateDiff(raw: any[], clean: any[]): DiffRow[] {
  const diff: DiffRow[] = [];
  const maxRows = Math.min(raw.length, clean.length);
  
  for (let i = 0; i < maxRows; i++) {
    const rawRow = raw[i] || {};
    const cleanRow = clean[i] || {};
    const changes: Record<string, DiffChange> = {};
    const allKeys = new Set([...Object.keys(rawRow), ...Object.keys(cleanRow)]);
    
    for (const key of allKeys) {
      const before = rawRow[key];
      const after = cleanRow[key];
      
      // Check if value changed (handle null/undefined)
      const beforeStr = before === null || before === undefined ? '' : String(before);
      const afterStr = after === null || after === undefined ? '' : String(after);
      
      if (beforeStr !== afterStr) {
        changes[key] = { before, after };
      }
    }
    
    if (Object.keys(changes).length > 0) {
      diff.push({
        row: i,
        changes,
        raw: rawRow,
        clean: cleanRow
      });
    }
  }
  
  return diff;
}

function DiffTable({ diff }: { diff: DiffRow[] }) {
  if (!diff || diff.length === 0) {
    return (
      <div className="p-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-emerald-400 uppercase">No Changes in Preview</span>
        </div>
        <p className="text-zinc-500 text-xs">The first 10 rows had no cell-level changes. Check the full dataset for structural changes.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto p-4">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="border-b border-zinc-800">
            <th className="text-left px-3 py-2 text-[10px] font-black uppercase text-zinc-500">Row</th>
            <th className="text-left px-3 py-2 text-[10px] font-black uppercase text-zinc-500">Column</th>
            <th className="text-left px-3 py-2 text-[10px] font-black uppercase text-rose-400">Before</th>
            <th className="text-left px-3 py-2 text-[10px] font-black uppercase text-emerald-400">After</th>
            <th className="text-left px-3 py-2 text-[10px] font-black uppercase text-zinc-500">Change Type</th>
          </tr>
        </thead>
        <tbody>
          {diff.map((row) => 
            Object.entries(row.changes).map(([col, change], idx) => (
              <tr key={`${row.row}-${col}`} className="border-b border-zinc-900/50 hover:bg-white/[0.02]">
                {idx === 0 && (
                  <td rowSpan={Object.keys(row.changes).length} className="px-3 py-2 text-zinc-400 font-mono">
                    #{row.row + 1}
                  </td>
                )}
                <td className="px-3 py-2 text-zinc-300 font-medium">{col}</td>
                <td className="px-3 py-2">
                  <span className="inline-block px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-mono text-[10px]">
                    {cellStr(change.before)}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <span className="inline-block px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px]">
                    {cellStr(change.after)}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <ChangeTypeBadge before={change.before} after={change.after} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function ChangeTypeBadge({ before, after }: { before: unknown; after: unknown }) {
  const beforeVal = before === null || before === undefined ? null : before;
  const afterVal = after === null || after === undefined ? null : after;
  
  // Detect change type
  let type = "modified";
  let color = "text-amber-400 bg-amber-500/10";
  
  if (beforeVal === null && afterVal !== null) {
    type = "filled";
    color = "text-blue-400 bg-blue-500/10";
  } else if (beforeVal !== null && afterVal === null) {
    type = "cleared";
    color = "text-rose-400 bg-rose-500/10";
  } else if (typeof beforeVal === 'string' && typeof afterVal === 'string') {
    // Check for case/whitespace changes
    const beforeNorm = beforeVal.toLowerCase().trim();
    const afterNorm = afterVal.toLowerCase().trim();
    if (beforeNorm === afterNorm) {
      type = "standardized";
      color = "text-purple-400 bg-purple-500/10";
    }
  }
  
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase ${color}`}>
      {type}
    </span>
  );
}

// Describe table component - shows statistics like pandas describe()
function DescribeTable({ stats }: { stats: any }) {
  if (!stats || !stats.numeric_summary) {
    return <div className="p-10 text-center text-zinc-500">No statistics available</div>;
  }
  
  const summary = stats.numeric_summary;
  const columns = Object.keys(summary);
  const metrics = ['count', 'mean', 'std', 'min', '25%', '50%', '75%', 'max'];
  
  return (
    <div className="overflow-x-auto p-4">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="border-b border-zinc-800">
            <th className="text-left px-3 py-2 text-[10px] font-black uppercase text-zinc-500">Metric</th>
            {columns.map(col => (
              <th key={col} className="text-right px-3 py-2 text-[10px] font-black uppercase text-zinc-500">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metrics.map(metric => (
            <tr key={metric} className="border-b border-zinc-900/50">
              <td className="px-3 py-2 text-zinc-400 font-medium capitalize">{metric}</td>
              {columns.map(col => (
                <td key={`${col}-${metric}`} className="px-3 py-2 text-zinc-300 font-mono text-right">
                  {summary[col]?.[metric] !== undefined ? Number(summary[col][metric]).toFixed(2) : '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Info table component - shows column types and non-null counts
function InfoTable({ preview, stats }: { preview: any[], stats: any }) {
  if (!preview || preview.length === 0) {
    return <div className="p-10 text-center text-zinc-500">No data available</div>;
  }
  
  const columns = Object.keys(preview[0]);
  const missingData = stats?.missing_values?.columns || {};
  
  return (
    <div className="overflow-x-auto p-4">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="border-b border-zinc-800">
            <th className="text-left px-3 py-2 text-[10px] font-black uppercase text-zinc-500">Column</th>
            <th className="text-left px-3 py-2 text-[10px] font-black uppercase text-zinc-500">Type</th>
            <th className="text-right px-3 py-2 text-[10px] font-black uppercase text-zinc-500">Non-Null</th>
            <th className="text-right px-3 py-2 text-[10px] font-black uppercase text-zinc-500">Null</th>
          </tr>
        </thead>
        <tbody>
          {columns.map(col => {
            const missing = missingData[col]?.count || 0;
            const nonNull = preview.length - missing;
            return (
              <tr key={col} className="border-b border-zinc-900/50">
                <td className="px-3 py-2 text-zinc-300 font-medium">{col}</td>
                <td className="px-3 py-2 text-zinc-400 font-mono">{typeof preview[0][col]}</td>
                <td className="px-3 py-2 text-emerald-400 font-mono text-right">{nonNull}</td>
                <td className="px-3 py-2 text-rose-400 font-mono text-right">{missing}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Top values component - shows most frequent values
function TopValuesTable({ preview }: { preview: any[] }) {
  if (!preview || preview.length === 0) {
    return <div className="p-10 text-center text-zinc-500">No data available</div>;
  }
  
  const columns = Object.keys(preview[0]);
  
  return (
    <div className="p-4 space-y-4">
      {columns.map(col => {
        const values = preview.map(row => row[col]);
        const frequency: Record<string, number> = {};
        values.forEach(v => {
          const key = String(v);
          frequency[key] = (frequency[key] || 0) + 1;
        });
        const topValues = Object.entries(frequency)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3);
        
        return (
          <div key={col} className="border-b border-zinc-800 pb-3 last:border-0">
            <div className="text-[10px] font-black uppercase text-zinc-500 mb-2">{col}</div>
            <div className="space-y-1">
              {topValues.map(([val, count], idx) => (
                <div key={idx} className="flex justify-between text-xs">
                  <span className="text-zinc-300 font-mono truncate max-w-[200px]">{val}</span>
                  <span className="text-zinc-500">{count}x</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function DataPreviewTabs({ rawPreview = [], cleanPreview = [], diffPreview = [], rawStats, cleanStats }: DataPreviewTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("compare");

  useEffect(() => {
    const handle = (e: any) => e.detail?.tab && setActiveTab(e.detail.tab);
    window.addEventListener("switch-to-tab", handle);
    return () => window.removeEventListener("switch-to-tab", handle);
  }, []);

  // Generate diff if not provided
  const generatedDiff = diffPreview.length > 0 ? diffPreview : generateDiff(rawPreview, cleanPreview);
  const totalChanges = generatedDiff.reduce((acc, row) => acc + Object.keys(row.changes).length, 0);

  const tabs = [
    { id: "compare", label: "Comparison", icon: Columns },
    { id: "raw", label: "Head (Raw)", badge: `${rawPreview.length}` },
    { id: "clean", label: "Head (Clean)", badge: `${cleanPreview.length}` },
    { id: "describe", label: "Describe" },
    { id: "info", label: "Info" },
    { id: "top", label: "Top Values" },
    { id: "diff", label: "Changes", badge: `${totalChanges}` },
  ];

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-zinc-950/60 overflow-hidden">
      <div className="flex items-center gap-1 p-3 border-b border-white/[0.06] bg-zinc-950/40 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as Tab)} className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all", activeTab === tab.id ? "bg-white/10 text-white" : "text-zinc-600 hover:text-zinc-300")}>
            {tab.icon && <tab.icon className="w-3 h-3" />}
            {tab.label}
            {tab.badge && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-zinc-800">{tab.badge}</span>}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          {activeTab === "compare" && <HeadComparison raw={rawPreview} clean={cleanPreview} />}
          {activeTab === "raw" && <PreviewTable data={rawPreview} />}
          {activeTab === "clean" && <PreviewTable data={cleanPreview} />}
          {activeTab === "describe" && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-px bg-white/[0.05]">
              <div className="bg-zinc-950 p-4">
                <h4 className="text-[10px] font-black uppercase text-rose-400 mb-4">Before (Original) - Describe</h4>
                <DescribeTable stats={rawStats} />
              </div>
              <div className="bg-zinc-950 p-4">
                <h4 className="text-[10px] font-black uppercase text-emerald-400 mb-4">After (Cleaned) - Describe</h4>
                <DescribeTable stats={cleanStats} />
              </div>
            </div>
          )}
          {activeTab === "info" && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-px bg-white/[0.05]">
              <div className="bg-zinc-950 p-4">
                <h4 className="text-[10px] font-black uppercase text-rose-400 mb-4">Before (Original) - Info</h4>
                <InfoTable preview={rawPreview} stats={rawStats} />
              </div>
              <div className="bg-zinc-950 p-4">
                <h4 className="text-[10px] font-black uppercase text-emerald-400 mb-4">After (Cleaned) - Info</h4>
                <InfoTable preview={cleanPreview} stats={cleanStats} />
              </div>
            </div>
          )}
          {activeTab === "top" && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-px bg-white/[0.05]">
              <div className="bg-zinc-950 p-4">
                <h4 className="text-[10px] font-black uppercase text-rose-400 mb-4">Before (Original) - Top Values</h4>
                <TopValuesTable preview={rawPreview} />
              </div>
              <div className="bg-zinc-950 p-4">
                <h4 className="text-[10px] font-black uppercase text-emerald-400 mb-4">After (Cleaned) - Top Values</h4>
                <TopValuesTable preview={cleanPreview} />
              </div>
            </div>
          )}
          {activeTab === "diff" && <DiffTable diff={diffPreview.length > 0 ? diffPreview : generateDiff(rawPreview, cleanPreview)} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
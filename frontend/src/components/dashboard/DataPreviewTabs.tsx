"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, GitMerge, Columns, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "compare" | "raw" | "clean" | "diff";

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

export function DataPreviewTabs({ rawPreview = [], cleanPreview = [], diffPreview = [] }: DataPreviewTabsProps) {
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
    { id: "raw", label: "Raw", badge: `${rawPreview.length}` },
    { id: "clean", label: "Clean", badge: `${cleanPreview.length}` },
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
          {activeTab === "diff" && <DiffTable diff={diffPreview.length > 0 ? diffPreview : generateDiff(rawPreview, cleanPreview)} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
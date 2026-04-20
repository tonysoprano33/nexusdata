"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, GitMerge, Columns } from "lucide-react";
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

export function DataPreviewTabs({ rawPreview = [], cleanPreview = [], diffPreview = [] }: DataPreviewTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>("compare");

  useEffect(() => {
    const handle = (e: any) => e.detail?.tab && setActiveTab(e.detail.tab);
    window.addEventListener("switch-to-tab", handle);
    return () => window.removeEventListener("switch-to-tab", handle);
  }, []);

  const tabs = [
    { id: "compare", label: "Comparison", icon: Columns },
    { id: "raw", label: "Raw", badge: `${rawPreview.length}` },
    { id: "clean", label: "Clean", badge: `${cleanPreview.length}` },
    { id: "diff", label: "Changes", badge: `${diffPreview.length}` },
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
          {activeTab === "diff" && (
            <div className="p-10 text-center text-zinc-500 text-xs uppercase font-bold">
               {diffPreview.length > 0 ? `Detected ${diffPreview.length} changes in current sample` : "No specific cell changes detected"}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
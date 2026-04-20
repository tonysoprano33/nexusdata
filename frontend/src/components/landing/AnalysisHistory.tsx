"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Search, Loader2, CheckCircle2, XCircle, FileSpreadsheet, BarChart3, Sparkles, Trash2, ArrowRight, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardInsight } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { cn } from "@/lib/utils";
import type { AnalysisHistory as AnalysisHistoryType } from "@/types/analysis";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://nexusdata-api.onrender.com";

export function AnalysisHistory({
  hideHeader = false,
  viewMode,
  emptyState,
}: {
  hideHeader?: boolean;
  viewMode?: "grid" | "list";
  emptyState?: React.ReactNode;
}) {
  const [history, setHistory] = useState<AnalysisHistoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyStatusFilter, setHistoryStatusFilter] = useState<"all" | "processing" | "completed" | "failed">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const params = new URLSearchParams();
        params.set("limit", "24");
        if (historyStatusFilter !== "all") params.set("status", historyStatusFilter);
        const { data } = await axios.get(`${API_URL}/api/datasets/?` + params.toString());
        setHistory(data);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchHistory();
  }, [historyStatusFilter]);

  const filteredHistory = useMemo(() => {
    return history.filter(item => 
      item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [history, searchQuery]);

  return (
    <div className="w-full space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-2 p-1 bg-zinc-950 border border-zinc-900 rounded-sm">
          {["all", "processing", "completed", "failed"].map((key) => (
            <button
              key={key}
              onClick={() => { setLoading(true); setHistoryStatusFilter(key as any); }}
              className={cn(
                "capitalize px-4 py-1.5 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all",
                historyStatusFilter === key ? "bg-white text-black" : "text-zinc-600 hover:text-white"
              )}
            >
              {key}
            </button>
          ))}
        </div>

        <div className="relative group max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-700 group-focus-within:text-white transition-colors" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="FILTER BY MANIFEST ID..."
            className="w-full bg-black border border-zinc-900 pl-10 pr-4 h-10 text-[10px] font-black uppercase tracking-widest outline-none focus:border-zinc-700 transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-900 border border-zinc-900">
        <AnimatePresence mode="popLayout">
          {loading ? (
            Array(6).fill(0).map((_, i) => <div key={i} className="bg-black h-64 animate-pulse" />)
          ) : filteredHistory.map((item, index) => (
            <AnalysisCard
              key={item.id}
              item={item}
              onClick={() => router.push(`/dashboard/${item.id}`)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function AnalysisCard({ item, onClick }: { item: AnalysisHistoryType; onClick: () => void }) {
  const statusConfig = {
    processing: { color: "text-amber-500", label: "ANALYZING" },
    completed: { color: "text-emerald-500", label: "READY" },
    failed: { color: "text-rose-500", label: "FAILED" },
  };
  const config = statusConfig[item.status] || statusConfig.processing;

  return (
    <div 
      onClick={onClick}
      className="bg-black p-8 group cursor-pointer hover:bg-zinc-950 transition-colors relative"
    >
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-sm border border-zinc-900 flex items-center justify-center bg-zinc-950 group-hover:bg-white group-hover:text-black transition-all">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div className="truncate max-w-[180px]">
            <h4 className="text-sm font-black uppercase tracking-tighter truncate text-white">{item.filename}</h4>
            <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-1">ID: {item.id.slice(0,12)}</p>
          </div>
        </div>
        <div className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-1 border border-zinc-900 rounded-sm", config.color)}>
          {config.label}
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
           <div className="space-y-1">
              <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">Records</span>
              <p className="text-xl font-black text-zinc-300">{item.summary?.total_rows?.toLocaleString() || "-"}</p>
           </div>
           <div className="space-y-1">
              <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">Quality</span>
              <p className="text-xl font-black text-emerald-500">{item.data_quality_score ?? "-"}%</p>
           </div>
        </div>
        
        <div className="pt-6 border-t border-zinc-900/50 flex items-center justify-between">
           <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{item.created_at ? new Date(item.created_at).toLocaleDateString() : "—"}</span>
           <ArrowRight className="w-4 h-4 text-zinc-800 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, FileSpreadsheet, Trash2, ArrowRight, AlertTriangle } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import axios from "axios";

import { buildApiUrl } from "@/lib/api";
import {
  clearCachedAnalyses,
  readCachedAnalyses,
  removeCachedAnalysis,
} from "@/lib/analysis-cache";
import { cn } from "@/lib/utils";
import type { AnalysisHistory as AnalysisHistoryType } from "@/types/analysis";

function mapCachedToHistory(item: any): AnalysisHistoryType {
  const summary = item?.result?.summary ?? {};
  const cleaning = item?.result?.cleaning_report ?? {};

  return {
    id: item.id,
    filename: item.filename ?? "Dataset",
    status: item.status ?? "completed",
    created_at: item.created_at ?? null,
    data_quality_score: cleaning.score_after ?? null,
    summary: {
      total_rows: summary.total_rows ?? 0,
      total_columns: summary.total_columns ?? 0,
    },
  };
}

export function AnalysisHistory({
  hideHeader = false,
  viewMode = "grid",
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
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showDeleteAll, setShowDeleteAll] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchHistory = async () => {
      const cachedHistory = readCachedAnalyses().map(mapCachedToHistory);

      try {
        const params = new URLSearchParams();
        params.set("limit", "24");
        if (historyStatusFilter !== "all") params.set("status", historyStatusFilter);

        const { data } = await axios.get(buildApiUrl(`/api/datasets/?${params.toString()}`));
        if (Array.isArray(data) && data.length > 0) {
          setHistory(data);
          return;
        }
      } catch (error) {
        console.error(error);
      }

      setHistory(
        historyStatusFilter === "all"
          ? cachedHistory
          : cachedHistory.filter((item) => item.status === historyStatusFilter)
      );
    };

    fetchHistory().finally(() => setLoading(false));
  }, [historyStatusFilter]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Estas seguro de borrar este dataset?")) return;

    setDeleting(id);
    try {
      await axios.delete(buildApiUrl(`/api/datasets/${id}`));
    } catch (error) {
      console.error("Error deleting:", error);
    } finally {
      removeCachedAnalysis(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
      setDeleting(null);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm("Estas seguro? Se borraran todos los datasets.")) return;

    try {
      await axios.delete(buildApiUrl("/api/datasets/?confirm=true"));
    } catch (error) {
      console.error("Error deleting all:", error);
    } finally {
      clearCachedAnalyses();
      setHistory([]);
      setShowDeleteAll(false);
    }
  };

  const filteredHistory = useMemo(() => {
    return history.filter(
      (item) =>
        item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [history, searchQuery]);

  return (
    <div className="w-full space-y-12">
      {!hideHeader && (
        <div className="text-xs uppercase tracking-[0.3em] text-zinc-500">
          Historical analyses
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex items-center gap-2 p-1 bg-zinc-950 border border-zinc-900 rounded-sm">
          {["all", "processing", "completed", "failed"].map((key) => (
            <button
              key={key}
              onClick={() => {
                setLoading(true);
                setHistoryStatusFilter(key as "all" | "processing" | "completed" | "failed");
              }}
              className={cn(
                "capitalize px-4 py-1.5 rounded-sm text-[9px] font-black uppercase tracking-widest transition-all",
                historyStatusFilter === key ? "bg-white text-black" : "text-zinc-600 hover:text-white"
              )}
            >
              {key}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-700 group-focus-within:text-white transition-colors" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="FILTER BY DATASET OR ID..."
              className="w-full bg-black border border-zinc-900 pl-10 pr-4 h-10 text-[10px] font-black uppercase tracking-widest outline-none focus:border-zinc-700 transition-all"
            />
          </div>

          {history.length > 0 && (
            <button
              onClick={() => setShowDeleteAll(true)}
              className="flex items-center gap-2 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-400 border border-rose-900/50 hover:border-rose-500/50 rounded-sm transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Borrar Todo
            </button>
          )}
        </div>
      </div>

      {showDeleteAll && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-rose-900/50 rounded-sm p-8 max-w-md w-full">
            <div className="flex items-center gap-3 text-rose-500 mb-4">
              <AlertTriangle className="w-8 h-8" />
              <h3 className="text-lg font-black uppercase tracking-widest">Atencion</h3>
            </div>
            <p className="text-zinc-400 text-sm mb-6">
              Estas a punto de borrar <strong className="text-white">{history.length} datasets</strong>.
              Esta accion no se puede deshacer.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteAll(false)}
                className="flex-1 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-600 rounded-sm transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAll}
                className="flex-1 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white bg-rose-600 hover:bg-rose-500 rounded-sm transition-all"
              >
                Si, Borrar Todo
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className={cn(
          "grid gap-px bg-zinc-900 border border-zinc-900",
          viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
        )}
      >
        <AnimatePresence mode="popLayout">
          {loading ? (
            Array(6)
              .fill(0)
              .map((_, index) => <div key={index} className="bg-black h-64 animate-pulse" />)
          ) : filteredHistory.length > 0 ? (
            filteredHistory.map((item) => (
              <AnalysisCard
                key={item.id}
                item={item}
                onClick={() => router.push(`/dashboard/${item.id}`)}
                onDelete={handleDelete}
                isDeleting={deleting === item.id}
              />
            ))
          ) : (
            <div className="col-span-full bg-black">
              {emptyState ?? (
                <div className="py-24 text-center text-zinc-500 text-sm">
                  No datasets found.
                </div>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function AnalysisCard({
  item,
  onClick,
  onDelete,
  isDeleting,
}: {
  item: AnalysisHistoryType;
  onClick: () => void;
  onDelete?: (id: string, e: React.MouseEvent) => void;
  isDeleting?: boolean;
}) {
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
            <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-1">
              ID: {item.id.slice(0, 12)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onDelete && (
            <button
              onClick={(event) => onDelete(item.id, event)}
              disabled={isDeleting}
              className="p-2 text-zinc-600 hover:text-rose-500 hover:bg-rose-950/30 rounded-sm transition-all disabled:opacity-50"
              title="Borrar dataset"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            </button>
          )}
          <div
            className={cn(
              "text-[9px] font-black uppercase tracking-widest px-2 py-1 border border-zinc-900 rounded-sm",
              config.color
            )}
          >
            {config.label}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">Records</span>
            <p className="text-xl font-black text-zinc-300">
              {item.summary?.total_rows?.toLocaleString() || "-"}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest">Quality</span>
            <p className="text-xl font-black text-emerald-500">{item.data_quality_score ?? "-"}%</p>
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-900/50 flex items-center justify-between">
          <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">
            {item.created_at ? new Date(item.created_at).toLocaleDateString() : "-"}
          </span>
          <ArrowRight className="w-4 h-4 text-zinc-800 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </div>
  );
}

"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Search, Loader2, CheckCircle2, XCircle, FileSpreadsheet, BarChart3, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalysisHistory as AnalysisHistoryType } from "@/types/analysis";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://nexusdata-api.onrender.com";

export function AnalysisHistory() {
  const [history, setHistory] = useState<AnalysisHistoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyStatusFilter, setHistoryStatusFilter] = useState<"all" | "processing" | "completed" | "failed">("all");
  const router = useRouter();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const params = new URLSearchParams();
        params.set("limit", "12");
        if (historyStatusFilter !== "all") params.set("status", historyStatusFilter);
        const { data } = await axios.get(`${API_URL}/api/datasets/?` + params.toString());
        setHistory(data);
      } catch (error) {
        console.error("Error loading history", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [historyStatusFilter]);

  const filteredHistory = useMemo(() => {
    if (historyStatusFilter === "all") return history;
    return history.filter(item => item.status === historyStatusFilter);
  }, [history, historyStatusFilter]);

  return (
    <section className="max-w-6xl mx-auto px-6 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Clock className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Historial de Análisis</h2>
            <p className="text-sm text-neutral-400">{history.length} análisis guardados</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {["all", "processing", "completed", "failed"].map((key) => (
            <Button
              key={key}
              size="sm"
              variant={historyStatusFilter === key ? "default" : "outline"}
              onClick={() => { setLoading(true); setHistoryStatusFilter(key as any); }}
              className={`capitalize ${
                historyStatusFilter === key ? "bg-indigo-600 text-white" : "border-white/10 text-neutral-400"
              }`}
            >
              {key}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <Card key={i} className="bg-neutral-900/30 border-white/5 p-4 space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-1/2 bg-white/5" />
                  <Skeleton className="h-6 w-20 bg-white/5" />
                </div>
                <Skeleton className="h-3 w-1/4 bg-white/5" />
                <div className="pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
                  <Skeleton className="h-10 bg-white/5" />
                  <Skeleton className="h-10 bg-white/5" />
                </div>
              </Card>
            ))
          ) : filteredHistory.length === 0 ? (
            <div className="col-span-full py-12 text-center">
              <Search className="h-10 w-10 text-neutral-600 mx-auto mb-4" />
              <p className="text-neutral-500">No se encontraron análisis</p>
            </div>
          ) : (
            filteredHistory.map((item, index) => (
              <AnalysisCard
                key={item.id}
                item={item}
                index={index}
                onClick={() => router.push(`/dashboard/${item.id}`)}
              />
            ))
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function AnalysisCard({ item, index, onClick }: { item: AnalysisHistoryType; index: number; onClick: () => void }) {
  const statusConfig = {
    processing: { icon: Loader2, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "Procesando", spin: true },
    completed: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Completado", spin: false },
    failed: { icon: XCircle, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", label: "Fallido", spin: false },
  };

  const config = statusConfig[item.status] || statusConfig.processing;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        className="group bg-neutral-900/40 border-white/10 hover:border-indigo-500/40 transition-all cursor-pointer overflow-hidden relative shadow-lg"
        onClick={onClick}
      >
        <div className={`h-1 w-full ${item.status === "completed" ? "bg-emerald-500/50" : item.status === "processing" ? "bg-amber-500/50" : "bg-rose-500/50"}`} />
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <FileSpreadsheet className="h-4 w-4 text-neutral-500 shrink-0" />
                <p className="text-sm font-semibold text-white truncate">{item.filename}</p>
              </div>
              <p className="text-xs text-neutral-500">
                {item.created_at ? new Date(item.created_at).toLocaleDateString() : "Sin fecha"}
              </p>
            </div>
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${config.bg} border ${config.border}`}>
              <config.icon className={`h-3 w-3 ${config.color} ${config.spin ? "animate-spin" : ""}`} />
              <span className={`text-[10px] font-bold uppercase tracking-wider ${config.color}`}>{config.label}</span>
            </div>
          </div>

          {item.status === "completed" && (
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/5">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-3.5 w-3.5 text-indigo-400" />
                <div>
                  <p className="text-[10px] text-neutral-500 uppercase">Filas</p>
                  <p className="text-xs font-bold text-white">{item.summary?.total_rows?.toLocaleString() || "-"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                <div>
                  <p className="text-[10px] text-neutral-500 uppercase">Calidad</p>
                  <p className="text-xs font-bold text-emerald-400">{item.data_quality_score ?? "-"}%</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
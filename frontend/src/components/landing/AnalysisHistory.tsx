"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, Search, Loader2, CheckCircle2, XCircle, FileSpreadsheet, BarChart3, Sparkles, Filter, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { AnalysisHistory as AnalysisHistoryType } from "@/types/analysis";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://nexusdata-api.onrender.com";

interface AnalysisHistoryProps {
  hideHeader?: boolean;
}

export function AnalysisHistory({ hideHeader = false }: AnalysisHistoryProps) {
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
      } catch (error) {
        console.error("Error loading history", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [historyStatusFilter]);

  const filteredHistory = useMemo(() => {
    let result = history;
    if (searchQuery) {
      result = result.filter(item => 
        item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return result;
  }, [history, searchQuery]);

  return (
    <section className="w-full">
      {!hideHeader && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center shadow-lg">
              <Clock className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white">Recents Analysis</h2>
              <p className="text-[13px] text-neutral-500 font-medium">{history.length} datasets stored in cloud</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-neutral-900/50 border border-neutral-800/60 rounded-2xl">
            {["all", "processing", "completed", "failed"].map((key) => (
              <Button
                key={key}
                size="sm"
                variant="ghost"
                onClick={() => { setLoading(true); setHistoryStatusFilter(key as any); }}
                className={cn(
                  "capitalize px-4 py-2 rounded-xl text-[12px] font-bold transition-all",
                  historyStatusFilter === key 
                    ? "bg-neutral-800 text-white shadow-lg" 
                    : "text-neutral-500 hover:text-white hover:bg-white/5"   
                )}
              >
                {key}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Search Bar - only if header is hidden (means we are in Management page) */}
      {hideHeader && (
        <div className="relative mb-8 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-blue-400 transition-colors" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search in your inventory..."
            className="w-full bg-neutral-950 border border-neutral-800/50 hover:border-neutral-700/50 pl-12 pr-4 h-12 rounded-2xl text-sm transition-all focus:ring-2 focus:ring-blue-500/10 outline-none"
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {loading ? (
            Array(6).fill(0).map((_, i) => (
              <Card key={i} className="bg-[#0f0f0f] border-neutral-800/60 p-6 rounded-3xl space-y-5 shadow-xl">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-3/4 bg-white/5 rounded-lg" />
                    <Skeleton className="h-3 w-1/3 bg-white/5 rounded-lg" />
                  </div>
                  <Skeleton className="h-7 w-20 bg-white/5 rounded-lg" />
                </div>
                <div className="pt-5 border-t border-white/5 grid grid-cols-2 gap-4">
                  <Skeleton className="h-10 bg-white/5 rounded-xl" />
                  <Skeleton className="h-10 bg-white/5 rounded-xl" />
                </div>
              </Card>
            ))
          ) : filteredHistory.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-[#0f0f0f] border border-neutral-800/60 border-dashed rounded-[3rem]">
              <Search className="h-12 w-12 text-neutral-800 mx-auto mb-4" />
              <p className="text-neutral-500 font-bold text-lg">No results found</p>
              <p className="text-neutral-600 text-sm mt-1">Try a different search query or filter.</p>
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
    processing: { icon: Loader2, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "Analizing", spin: true },
    completed: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Ready", spin: false },
    failed: { icon: XCircle, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", label: "Failed", spin: false },
  };

  const config = statusConfig[item.status] || statusConfig.processing;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.04 }}
    >
      <Card
        className="group bg-[#0f0f0f] border-neutral-800/60 hover:border-blue-500/40 transition-all cursor-pointer overflow-hidden relative shadow-xl rounded-3xl"
        onClick={onClick}
      >
        <div className={cn(
          "h-1.5 w-full opacity-30 group-hover:opacity-100 transition-opacity",
          item.status === "completed" ? "bg-emerald-500" : item.status === "processing" ? "bg-amber-500" : "bg-rose-500"
        )} />
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1.5">
                <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800/50 group-hover:bg-neutral-800 transition-colors">
                  <FileSpreadsheet className="h-5 w-5 text-neutral-400" />
                </div>
                <p className="text-[15px] font-black text-white truncate group-hover:text-blue-400 transition-colors leading-tight">
                  {item.filename}
                </p>
              </div>
              <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest ml-12">
                {item.created_at ? new Date(item.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short' }) : "No Date"}
              </p>
            </div>
            <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-lg border", config.bg, config.border)}>
              <config.icon className={cn("h-3 w-3", config.color, config.spin ? "animate-spin" : "")} />        
              <span className={cn("text-[9px] font-black uppercase tracking-widest", config.color)}>{config.label}</span>
            </div>
          </div>

          {item.status === "completed" && (
            <div className="grid grid-cols-2 gap-4 mt-4 pt-5 border-t border-white/[0.04]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-3.5 w-3.5 text-blue-500" />
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Records</span>
                </div>
                <p className="text-sm font-black text-white ml-5.5 tracking-tight">{item.summary?.total_rows?.toLocaleString() || "-"}</p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Quality</span>
                </div>
                <p className="text-sm font-black text-emerald-400 ml-5.5 tracking-tight">{item.data_quality_score ?? "-"}%</p>       
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
             <div className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-500 transition-all">
                <ArrowRight className="w-4 h-4 text-neutral-600 group-hover:text-white" />
             </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

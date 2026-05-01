"use client";
import { useRouter } from "next/navigation";
import { Eye, Upload, Activity } from "lucide-react";
import { motion } from "framer-motion";

interface HeroBannerProps {
  filename: string;
  totalRows: number;
  totalColumns: number;
  qualityBefore: number;
  qualityAfter: number;
  rowsRemoved: number;
  improvement: number;
  statistics?: any;
  onScrollTo?: (sectionId: string) => void;
}

export function HeroBanner({
  filename,
  totalRows,
  totalColumns,
  qualityBefore,
  qualityAfter,
  rowsRemoved,
  improvement,
  statistics,
  onScrollTo
}: HeroBannerProps) {
  const router = useRouter();
  const minutesSaved = Math.ceil(totalRows * 0.12);

  // Get missing values and duplicates from statistics if available
  const missingValues = statistics?.raw?.missing_values?.total || 0;
  const duplicatesRemoved = rowsRemoved > 0 ? rowsRemoved : 0;
  const dataReduction = totalRows > 0 ? ((rowsRemoved / totalRows) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6 mb-10">
      {/* Header with status and upload button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Dataset Cleaned</span>
          </div>
          <button onClick={() => router.push("/datasets")} className="text-[10px] font-bold text-zinc-500 hover:text-white uppercase flex items-center gap-1">
            <Upload className="w-3 h-3" /> Upload Another
          </button>
        </div>
      </div>

      {/* Main Banner Card */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-[2rem] border border-white/[0.05] bg-zinc-900 p-8 shadow-2xl">
        <div className="flex flex-col xl:flex-row items-center gap-10">
          <div className="flex-1 space-y-6">
            {/* Title and basic info */}
            <div>
              <h1 className="text-3xl font-black text-white truncate">{filename}</h1>
              <p className="text-zinc-500 font-mono text-xs mt-2">{totalRows.toLocaleString()} rows / {totalColumns} columns</p>
            </div>
            
            {/* Stats Grid - Valuable information, not generic */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Time Saved */}
              <div className="px-3 py-2 rounded-xl bg-zinc-800/50 border border-white/5">
                <div className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Time Saved</div>
                <div className="text-lg font-black text-indigo-400">~{minutesSaved}min</div>
                <div className="text-[9px] text-zinc-600">Manual analysis avoided</div>
              </div>
              
              {/* Data Quality Score */}
              <div className="px-3 py-2 rounded-xl bg-zinc-800/50 border border-white/5">
                <div className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Quality Score</div>
                <div className="text-lg font-black text-emerald-400">{qualityAfter}%</div>
                <div className="text-[9px] text-zinc-600">From {qualityBefore}% baseline</div>
              </div>
              
              {/* Issues Fixed - most valuable */}
              <div className="px-3 py-2 rounded-xl bg-zinc-800/50 border border-white/5">
                <div className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Issues Fixed</div>
                <div className="text-lg font-black text-amber-400">{missingValues + duplicatesRemoved}</div>
                <div className="text-[9px] text-zinc-600">Missing + Duplicates</div>
              </div>
              
              {/* Data Reduction */}
              <div className="px-3 py-2 rounded-xl bg-zinc-800/50 border border-white/5">
                <div className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Optimization</div>
                <div className="text-lg font-black text-rose-400">-{dataReduction}%</div>
                <div className="text-[9px] text-zinc-600">{rowsRemoved} rows removed</div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
               <button
                 onClick={() => {
                   window.dispatchEvent(new CustomEvent("switch-to-tab", { detail: { tab: "compare" } }));
                   onScrollTo?.("preview");
                 }}
                 className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm bg-white text-black hover:bg-zinc-200 transition-all active:scale-95"
               >
                 <Eye className="w-4 h-4" />
                 View All Changes
               </button>
               
               <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                 <Activity className="w-4 h-4 text-indigo-400" />
                 <span className="text-xs font-bold text-indigo-300">AI Analysis Complete</span>
               </div>
            </div>
          </div>

          {/* Right side - Big Quality Score Display */}
          <div className="shrink-0 p-6 border-l border-white/[0.05]">
             <div className="text-center">
                <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest mb-1">Health Score</p>
                <div className="text-4xl font-black text-white">{qualityAfter}%</div>
                <div className="text-[10px] text-emerald-400 font-bold mt-1">{qualityBefore}% to {qualityAfter}%</div>
                <div className="text-[9px] text-zinc-500 mt-2">+{improvement}% improvement</div>
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

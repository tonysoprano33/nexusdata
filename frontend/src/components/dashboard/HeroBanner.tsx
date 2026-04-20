"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Eye, FileText, Share2, Upload, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface HeroBannerProps {
  filename: string;
  totalRows: number;
  totalColumns: number;
  qualityBefore: number;
  qualityAfter: number;
  datasetId: string;
  onScrollTo: (section: string) => void;
}

export function HeroBanner({
  filename, totalRows, totalColumns, qualityBefore, qualityAfter, datasetId, onScrollTo,
}: HeroBannerProps) {
  const router = useRouter();
  const minutesSaved = Math.round((totalRows / 500) * 5 + totalColumns * 2);

  return (
    <div className="space-y-6 mb-10">
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

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-[2rem] border border-white/[0.05] bg-zinc-900 p-8 shadow-2xl">
        <div className="flex flex-col xl:flex-row items-center gap-10">
          <div className="flex-1 space-y-6">
            <div>
              <h1 className="text-3xl font-black text-white truncate">{filename}</h1>
              <p className="text-zinc-500 font-mono text-xs mt-2">{totalRows.toLocaleString()} rows • {totalColumns} columns</p>
            </div>
            
            <div className="inline-flex items-center gap-3 px-4 py-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
               <Activity className="w-5 h-5 text-indigo-400" />
               <p className="text-sm font-black text-indigo-300">~{minutesSaved} min of manual analysis avoided</p>
            </div>

            <div>
               <button
                 onClick={() => {
                   window.dispatchEvent(new CustomEvent("switch-to-tab", { detail: { tab: "compare" } }));
                   onScrollTo("preview");
                 }}
                 className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm bg-white text-black hover:bg-zinc-200 transition-all active:scale-95"
               >
                 <Eye className="w-4 h-4" />
                 View All Changes
               </button>
            </div>
          </div>

          <div className="shrink-0 p-6 border-l border-white/[0.05]">
             <div className="text-center">
                <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest mb-1">Health Score</p>
                <div className="text-4xl font-black text-white">{qualityAfter}%</div>
                <div className="text-[10px] text-emerald-400 font-bold mt-1">+{qualityAfter - qualityBefore}% gain</div>
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
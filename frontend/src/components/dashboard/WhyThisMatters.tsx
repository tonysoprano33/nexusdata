"use client";

import { Sparkles } from "lucide-react";

export function WhyThisMatters() {
  return (
    <div className="rounded-sm border border-white/[0.06] bg-gradient-to-r from-zinc-950 to-black p-6 sm:p-8">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-sm border border-blue-500/20 bg-blue-500/10 flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-blue-300" />
        </div>
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-2">
            Why this matters
          </div>
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-3xl">
            This tool helps teams move from messy spreadsheets to clear decisions by automating cleaning, exploration, quality checks, and business recommendations.
          </p>
        </div>
      </div>
    </div>
  );
}


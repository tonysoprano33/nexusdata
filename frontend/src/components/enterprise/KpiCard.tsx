"use client";
import { motion } from "framer-motion";
import { Card, CardInsight } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon, Zap } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color: "blue" | "emerald" | "amber" | "rose" | "violet" | "cyan";
  delay?: number;
  className?: string;
}

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  delay = 0,
  className,
}: KpiCardProps) {
  const colorMap = {
    blue: "text-blue-400 border-blue-500/20 bg-blue-500/5",
    emerald: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
    amber: "text-amber-400 border-amber-500/20 bg-amber-500/5",
    rose: "text-rose-400 border-rose-500/20 bg-rose-500/5",
    violet: "text-violet-400 border-violet-500/20 bg-violet-500/5",
    cyan: "text-cyan-400 border-cyan-500/20 bg-cyan-500/5",
  };

  return (
    <Card className={cn("group h-full flex flex-col justify-between", className)}>
      <div className="flex items-start justify-between mb-8">
        <div className="space-y-1.5">
           <div className="flex items-center gap-2">
             <div className={cn("w-1.5 h-1.5 rounded-full", colorMap[color].split(" ")[0])} />
             <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">{title}</p>
           </div>
           <h2 className="text-4xl font-black tracking-tighter text-white">{value}</h2>
        </div>
        <div className={cn("p-2.5 rounded-xl border transition-all duration-500 group-hover:scale-110 shadow-lg", colorMap[color])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="space-y-4">
        {subtitle && (
          <p className="text-xs font-bold text-zinc-500 leading-relaxed uppercase tracking-wider">
            {subtitle}
          </p>
        )}
        <CardInsight label="Neural Score" className="bg-white/[0.02] border-white/[0.05]">
           <div className="flex items-center gap-2">
             <Zap className={cn("w-3 h-3", colorMap[color].split(" ")[0])} />
             <span className="text-[10px] font-black tracking-widest uppercase">Optimized Integrity</span>
           </div>
        </CardInsight>
      </div>
      
      {/* Glow Effect */}
      <div className={cn(
        "absolute -bottom-12 -right-12 w-24 h-24 blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none rounded-full",
        colorMap[color].split(" ")[2]
      )} />
    </Card>
  );
}

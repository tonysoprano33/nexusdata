"use client";
import { Card, CardInsight } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon, Zap } from "lucide-react";

export function KpiCard({ title, value, subtitle, icon: Icon, className }: { title: string, value: string | number, subtitle?: string, icon: LucideIcon, className?: string }) {
  return (
    <Card className={cn("p-5 border-zinc-900 bg-black", className)}>
      <div className="flex items-start justify-between mb-8 pb-4 border-b border-zinc-900/50">
        <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
           <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">{title}</p>
        </div>
        <Icon className="w-4 h-4 text-zinc-700" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-4xl font-black tracking-tighter text-white">{value}</h2>
        {subtitle && (
          <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-widest truncate">
            {subtitle}
          </p>
        )}
      </div>

      <div className="mt-8 pt-4 border-t border-zinc-900 flex items-center gap-2 opacity-50">
         <Zap className="w-3 h-3 text-zinc-700" />
         <span className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.3em]">Telemetry Active</span>
      </div>
    </Card>
  );
}

"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Minus, LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  color: "blue" | "emerald" | "amber" | "rose" | "violet" | "cyan";
  delay?: number;
  className?: string;
}

const colorVariants = {
  blue: {
    bg: "from-blue-500/10 to-blue-600/5",
    border: "border-blue-500/10 hover:border-blue-500/30",
    icon: "text-blue-400",
    iconBg: "bg-blue-500/10",
    value: "text-white",
    trend: "text-blue-400",
    glow: "group-hover:bg-blue-500/5",
  },
  emerald: {
    bg: "from-emerald-500/10 to-emerald-600/5",
    border: "border-emerald-500/10 hover:border-emerald-500/30",
    icon: "text-emerald-400",
    iconBg: "bg-emerald-500/10",
    value: "text-white",
    trend: "text-emerald-400",
    glow: "group-hover:bg-emerald-500/5",
  },
  amber: {
    bg: "from-amber-500/10 to-amber-600/5",
    border: "border-amber-500/10 hover:border-amber-500/30",
    icon: "text-amber-400",
    iconBg: "bg-amber-500/10",
    value: "text-white",
    trend: "text-amber-400",
    glow: "group-hover:bg-amber-500/5",
  },
  rose: {
    bg: "from-rose-500/10 to-rose-600/5",
    border: "border-rose-500/10 hover:border-rose-500/30",
    icon: "text-rose-400",
    iconBg: "bg-rose-500/10",
    value: "text-white",
    trend: "text-rose-400",
    glow: "group-hover:bg-rose-500/5",
  },
  violet: {
    bg: "from-violet-500/10 to-violet-600/5",
    border: "border-violet-500/10 hover:border-violet-500/30",
    icon: "text-violet-400",
    iconBg: "bg-violet-500/10",
    value: "text-white",
    trend: "text-violet-400",
    glow: "group-hover:bg-violet-500/5",
  },
  cyan: {
    bg: "from-cyan-500/10 to-cyan-600/5",
    border: "border-cyan-500/10 hover:border-cyan-500/30",
    icon: "text-cyan-400",
    iconBg: "bg-cyan-500/10",
    value: "text-white",
    trend: "text-cyan-400",
    glow: "group-hover:bg-cyan-500/5",
  },
};

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  color,
  delay = 0,
  className,
}: KpiCardProps) {
  const colors = colorVariants[color];
  const TrendIcon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ 
        delay, 
        duration: 0.3, 
        ease: "easeOut",
        whileHover: { duration: 0.2 }
      }}
      className="h-full"
    >
      <Card
        className={cn(
          "relative h-full overflow-hidden",
          "bg-[#0f0f0f] border transition-all duration-300",
          colors.border,
          "group cursor-pointer",
          className
        )}
      >
        {/* Subtle background gradient */}
        <div className={cn(
          "absolute inset-0 opacity-20 transition-opacity duration-500",
          "bg-gradient-to-br",
          colors.bg,
          "group-hover:opacity-40"
        )} />

        <div className="relative p-6 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-1">
              <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest">
                {title}
              </p>
            </div>
            <div className={cn(
              "p-2 rounded-lg transition-colors duration-300",
              colors.iconBg,
              "group-hover:bg-opacity-20"
            )}>
              <Icon className={cn("w-4 h-4", colors.icon)} />
            </div>
          </div>

          {/* Value Section */}
          <div className="mt-auto space-y-1">
            <div className="flex items-baseline gap-2">
              <h2 className={cn(
                "text-4xl font-bold tracking-tight",
                colors.value
              )}>
                {value}
              </h2>
              {trend && (
                <div className={cn(
                  "flex items-center text-[13px] font-semibold",
                  colors.trend
                )}>
                  <TrendIcon className="w-3.5 h-3.5 mr-0.5" />
                  {trendValue}
                </div>
              )}
            </div>
            
            {subtitle && (
              <p className="text-[13px] font-medium text-neutral-500 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>

          {/* Premium Bottom Accent */}
          <div className={cn(
            "absolute bottom-0 left-0 right-0 h-[1.5px] opacity-0 group-hover:opacity-100 transition-opacity duration-500",
            "bg-gradient-to-r from-transparent via-current to-transparent",
            colors.icon
          )} />
        </div>
      </Card>
    </motion.div>
  );
}

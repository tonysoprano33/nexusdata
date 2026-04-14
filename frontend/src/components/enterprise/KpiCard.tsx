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
    border: "border-blue-500/20",
    icon: "text-blue-400",
    iconBg: "bg-blue-500/10",
    value: "text-blue-100",
    trend: "text-blue-400",
  },
  emerald: {
    bg: "from-emerald-500/10 to-emerald-600/5",
    border: "border-emerald-500/20",
    icon: "text-emerald-400",
    iconBg: "bg-emerald-500/10",
    value: "text-emerald-100",
    trend: "text-emerald-400",
  },
  amber: {
    bg: "from-amber-500/10 to-amber-600/5",
    border: "border-amber-500/20",
    icon: "text-amber-400",
    iconBg: "bg-amber-500/10",
    value: "text-amber-100",
    trend: "text-amber-400",
  },
  rose: {
    bg: "from-rose-500/10 to-rose-600/5",
    border: "border-rose-500/20",
    icon: "text-rose-400",
    iconBg: "bg-rose-500/10",
    value: "text-rose-100",
    trend: "text-rose-400",
  },
  violet: {
    bg: "from-violet-500/10 to-violet-600/5",
    border: "border-violet-500/20",
    icon: "text-violet-400",
    iconBg: "bg-violet-500/10",
    value: "text-violet-100",
    trend: "text-violet-400",
  },
  cyan: {
    bg: "from-cyan-500/10 to-cyan-600/5",
    border: "border-cyan-500/20",
    icon: "text-cyan-400",
    iconBg: "bg-cyan-500/10",
    value: "text-cyan-100",
    trend: "text-cyan-400",
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      <Card
        className={cn(
          "relative overflow-hidden",
          "bg-gradient-to-br border",
          colors.bg,
          colors.border,
          "hover:shadow-lg hover:shadow-black/20",
          "transition-all duration-300",
          "group cursor-pointer",
          className
        )}
      >
        {/* Glow effect on hover */}
        <div className={cn(
          "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
          "bg-gradient-to-br",
          colors.bg
        )} />
        
        <div className="relative p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className={cn(
              "p-2.5 rounded-xl",
              colors.iconBg
            )}>
              <Icon className={cn("w-5 h-5", colors.icon)} />
            </div>
            
            {trend && (
              <div className={cn(
                "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                colors.trend,
                "bg-white/5"
              )}>
                <TrendIcon className="w-3 h-3" />
                {trendValue}
              </div>
            )}
          </div>
          
          {/* Value */}
          <div className="space-y-1">
            <h3 className="text-sm font-medium text-neutral-500">{title}</h3>
            <p className={cn(
              "text-3xl font-bold tracking-tight",
              colors.value
            )}>
              {value}
            </p>
            {subtitle && (
              <p className="text-s text-neutral-400">{subtitle}</p>
            )}
          </div>
          
          {/* Bottom decoration line */}
          <div className={cn(
            "absolute bottom-0 left-0 right-0 h-0.5",
            "bg-gradient-to-r",
            color === "blue" ? "from-blue-500/50 via-blue-400/30 to-transparent" :
            color === "emerald" ? "from-emerald-500/50 via-emerald-400/30 to-transparent" :
            color === "amber" ? "from-amber-500/50 via-amber-400/30 to-transparent" :
            color === "rose" ? "from-rose-500/50 via-rose-400/30 to-transparent" :
            color === "violet" ? "from-violet-500/50 via-violet-400/30 to-transparent" :
            "from-cyan-500/50 via-cyan-400/30 to-transparent",
            "transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
          )} />
        </div>
      </Card>
    </motion.div>
  );
}

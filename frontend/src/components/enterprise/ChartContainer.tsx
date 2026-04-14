"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Download,
  Expand,
  Lightbulb,
  Maximize2,
  X,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface ChartContainerProps {
  title: string;
  description?: string;
  insight?: string;
  type: string;
  children: React.ReactNode;
  index: number;
  className?: string;
  isFullScreen?: boolean;
  onFullScreen?: () => void;
}

export function ChartContainer({
  title,
  description,
  insight,
  type,
  children,
  index,
  className,
  isFullScreen,
  onFullScreen,
}: ChartContainerProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getChartIcon = () => {
    switch (type) {
      case 'bar': return '📊';
      case 'line': return '📈';
      case 'area': return '📉';
      case 'pie': return '🍕';
      case 'scatter': return '🔵';
      case 'heatmap': return '🔥';
      case 'histogram': return '📶';
      case 'box':
      case 'boxplot': return '📦';
      default: return '📊';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn("h-full", className)}
    >
      <Card className={cn(
        "bg-[#0f0f0f] border-neutral-800/60 overflow-hidden h-full flex flex-col transition-all duration-300 shadow-xl",
        "hover:border-neutral-700 hover:shadow-2xl hover:shadow-black/50",
        "group",
        isFullScreen && "fixed inset-4 z-50 bg-[#0a0a0a]"
      )}>
        {/* Header */}
        <CardHeader className="p-6 pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-3">
                <div className="text-xl group-hover:scale-110 transition-transform duration-300">
                  {getChartIcon()}
                </div>
                <CardTitle className="text-xl font-bold text-white tracking-tight leading-none truncate">
                  {title}
                </CardTitle>
                <Badge
                  variant="outline"
                  className="hidden sm:flex text-[9px] uppercase tracking-[0.15em] border-white/5 text-neutral-500 px-2 py-0.5 font-bold"
                >
                  {type}
                </Badge>
              </div>

              {description && (
                <CardDescription className="text-[13px] text-neutral-400 font-medium line-clamp-1">
                  {description}
                </CardDescription>
              )}
            </div>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#141414] border-neutral-800 text-neutral-300">
                  <DropdownMenuItem className="focus:bg-white/5 cursor-pointer py-2">
                    <Download className="w-4 h-4 mr-2" />
                    Download Analysis
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-white/5 cursor-pointer py-2">
                    <Expand className="w-4 h-4 mr-2" />
                    Expand view
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {onFullScreen && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-neutral-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  onClick={onFullScreen}
                >
                  {isFullScreen ? <X className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Chart Content */}
        <CardContent className={cn("p-6 pt-0 flex-1 flex flex-col min-h-0")}>
          <div className={cn(
            "relative rounded-xl overflow-hidden bg-neutral-900/40 border border-neutral-800/40 p-4 transition-all duration-500 group-hover:bg-neutral-900/60",
            isFullScreen ? "flex-1" : "h-[350px]"
          )}>
            {children}

            {/* Hover overlay with actions - refined */}
            <div className={cn(
              "absolute inset-0 bg-[#0a0a0a]/60 backdrop-blur-[2px]",
              "flex items-center justify-center",
              "transition-all duration-300 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto"
            )}>
              <Button
                size="md"
                className="bg-white text-black hover:bg-neutral-200 font-bold rounded-xl px-6 shadow-2xl scale-90 group-hover:scale-100 transition-transform duration-300"
              >
                <Expand className="w-4 h-4 mr-2" />
                Explorar Datos
              </Button>
            </div>
          </div>

          {/* AI Insight Box - Much more prominent */}
          {insight && (
            <div className="mt-5 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 group-hover:border-blue-500/20 transition-all duration-300">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1 rounded bg-blue-500/20">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <span className="text-[11px] font-bold text-blue-400 uppercase tracking-widest">
                  AI Observation
                </span>
              </div>
              <p className="text-[14px] text-neutral-300 leading-relaxed font-medium">
                {insight}
              </p>
            </div>
          )}
        </CardContent>

        {/* Bottom accent */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-neutral-800 to-transparent opacity-30" />
      </Card>
    </motion.div>
  );
}

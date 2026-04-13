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
  X
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
      case 'area': return '🏔️';
      case 'pie': return '🥧';
      case 'scatter': return '🔵';
      case 'heatmap': return '🔥';
      case 'histogram': return '📶';
      case 'box':
      case 'boxplot': return '📦';
      default: return '📉';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
    >
      <Card className={cn(
        "bg-[#141416] border-white/[0.06] overflow-hidden",
        "hover:border-white/[0.12] transition-all duration-300",
        "group",
        isFullScreen && "fixed inset-4 z-50"
      )}>
        {/* Header */}
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-base font-semibold text-white flex items-center gap-2">
                  <span className="text-lg">{getChartIcon()}</span>
                  <span className="truncate">{title}</span>
                </CardTitle>
              </div>
              
              {description && (
                <CardDescription className="text-xs text-neutral-500 line-clamp-1">
                  {description}
                </CardDescription>
              )}
              
              {insight && (
                <div className="flex items-start gap-1.5 mt-2">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-neutral-400 line-clamp-2">
                    {insight}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 ml-3">
              <Badge 
                variant="outline" 
                className="text-[10px] uppercase tracking-wider border-white/[0.08] text-neutral-500 px-1.5 py-0.5"
              >
                {type}
              </Badge>
              
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "icon" }),
                    "h-7 w-7 text-neutral-500 hover:text-white hover:bg-white/[0.06]"
                  )}
                >
                    <MoreHorizontal className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-white/[0.08]">
                  <DropdownMenuItem className="text-neutral-300 hover:bg-white/[0.06] focus:bg-white/[0.06] cursor-pointer text-xs">
                    <Download className="w-3.5 h-3.5 mr-2" />
                    Download PNG
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-neutral-300 hover:bg-white/[0.06] focus:bg-white/[0.06] cursor-pointer text-xs">
                    <Expand className="w-3.5 h-3.5 mr-2" />
                    View Data
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {onFullScreen && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-neutral-500 hover:text-white hover:bg-white/[0.06]"
                  onClick={onFullScreen}
                >
                  {isFullScreen ? <X className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Chart Content */}
        <CardContent className={cn("pt-0", isFullScreen && "flex-1")}>
          <div className={cn(
            "relative rounded-lg overflow-hidden",
            isFullScreen ? "h-[calc(100vh-200px)]" : "h-[300px]"
          )}>
            {children}
            
            {/* Hover overlay with actions */}
            <div className={cn(
              "absolute inset-0 bg-black/40 backdrop-blur-sm",
              "flex items-center justify-center gap-3",
              "transition-opacity duration-200",
              isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
            )}>
              <Button 
                size="sm" 
                variant="secondary"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              >
                <Expand className="w-4 h-4 mr-1.5" />
                Explore
              </Button>
            </div>
          </div>
        </CardContent>

        {/* Bottom gradient line */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />
      </Card>
    </motion.div>
  );
}

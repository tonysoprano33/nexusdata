"use client";

import { motion } from "framer-motion";
import {
  Search, 
  Bell, 
  Plus, 
  Sun, 
  Moon,
  Download,
  Share2,
  MoreHorizontal,
  Loader2
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface TopNavbarProps {
  sidebarCollapsed: boolean;
  datasetName?: string;
  datasetStatus?: "processing" | "completed" | "failed";
  dataQualityScore?: number;
  onUploadClick?: () => void;
  onExportPDF?: () => void;
  onExportPPT?: () => void;
}

export function TopNavbar({ 
  sidebarCollapsed, 
  datasetName,
  datasetStatus,
  dataQualityScore,
  onUploadClick,
  onExportPDF,
  onExportPPT
}: TopNavbarProps) {
  const [isDark, setIsDark] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const getStatusConfig = () => {
    switch (datasetStatus) {
      case "processing":
        return { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "Processing" };
      case "completed":
        return { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Ready" };
      case "failed":
        return { color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", label: "Error" };
      default:
        return { color: "text-neutral-400", bg: "bg-neutral-500/10", border: "border-neutral-500/20", label: "Draft" };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={cn(
        "fixed top-0 right-0 z-30 h-16",
        "bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/[0.08]",
        "flex items-center justify-between px-6",
        "transition-all duration-300"
      )}
      style={{ 
        left: sidebarCollapsed ? 80 : 260,
        width: `calc(100% - ${sidebarCollapsed ? 80 : 260}px)`
      }}
    >
      {/* Left: Search */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar datasets, insights, métricas..."
            className="pl-10 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-neutral-500 h-9 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Center: Dataset Info (if available) */}
      {datasetName && (
        <div className="hidden md:flex items-center gap-3 px-4">
          <div className="h-4 w-px bg-white/[0.08]" />
          <span className="text-sm text-neutral-400">Dataset:</span>
          <span className="text-sm font-medium text-white truncate max-w-[200px]">
            {datasetName}
          </span>
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs px-2 py-0.5",
              statusConfig.bg,
              statusConfig.border,
              statusConfig.color
            )}
          >
            {datasetStatus === "processing" && (
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            )}
            {statusConfig.label}
          </Badge>
          {dataQualityScore !== undefined && (
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs px-2 py-0.5",
                dataQualityScore >= 90 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                dataQualityScore >= 70 ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                "bg-rose-500/10 text-rose-400 border-rose-500/20"
              )}
            >
              Quality: {dataQualityScore}%
            </Badge>
          )}
        </div>
      )}

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Upload Button */}
        <Button
          onClick={onUploadClick}
          size="sm"
          className="bg-blue-600 hover:bg-blue-500 text-white h-9 px-3"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          <span className="hidden sm:inline">New Dataset</span>
        </Button>

        {/* Export Dropdown */}
        {(onExportPDF || onExportPPT) && (
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "border-white/[0.08] text-neutral-300 hover:bg-white/[0.06] hover:text-white h-9"
              )}
            >
                <Download className="w-4 h-4 mr-1.5" />
                <span className="hidden sm:inline">Export</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-white/[0.08] text-white">
              {onExportPDF && (
                <DropdownMenuItem 
                  onClick={onExportPDF}
                  className="hover:bg-white/[0.06] focus:bg-white/[0.06] cursor-pointer"
                >
                  <Download className="w-4 h-4 mr-2 text-neutral-400" />
                  Export as PDF
                </DropdownMenuItem>
              )}
              {onExportPPT && (
                <DropdownMenuItem 
                  onClick={onExportPPT}
                  className="hover:bg-white/[0.06] focus:bg-white/[0.06] cursor-pointer"
                >
                  <Download className="w-4 h-4 mr-2 text-neutral-400" />
                  Export as PowerPoint
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator className="bg-white/[0.08]" />
              <DropdownMenuItem className="hover:bg-white/[0.06] focus:bg-white/[0.06] cursor-pointer">
                <Share2 className="w-4 h-4 mr-2 text-neutral-400" />
                Share Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Theme Toggle */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsDark(!isDark)}
          className="border-white/[0.08] text-neutral-400 hover:bg-white/[0.06] hover:text-white h-9 w-9"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        {/* Notifications */}
        <Button
          variant="outline"
          size="icon"
          className="border-white/[0.08] text-neutral-400 hover:bg-white/[0.06] hover:text-white h-9 w-9 relative"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
        </Button>

        {/* More Options */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              buttonVariants({ variant: "outline", size: "icon" }),
              "border-white/[0.08] text-neutral-400 hover:bg-white/[0.06] hover:text-white h-9 w-9"
            )}
          >
              <MoreHorizontal className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#1a1a1a] border-white/[0.08] text-white">
            <DropdownMenuItem className="hover:bg-white/[0.06] focus:bg-white/[0.06] cursor-pointer">
              Keyboard Shortcuts
            </DropdownMenuItem>
            <DropdownMenuItem className="hover:bg-white/[0.06] focus:bg-white/[0.06] cursor-pointer">
              Help & Support
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/[0.08]" />
            <DropdownMenuItem className="hover:bg-white/[0.06] focus:bg-white/[0.06] cursor-pointer text-red-400">
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
}

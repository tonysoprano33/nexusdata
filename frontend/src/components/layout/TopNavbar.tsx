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
  Loader2,
  Menu,
  Sparkles
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
import { useState, useEffect } from "react";

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
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const getStatusConfig = () => {
    switch (datasetStatus) {
      case "processing":
        return { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "Processing" };
      case "completed":
        return { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Live" };
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
        "fixed top-0 right-0 z-30 h-16 transition-all duration-300",
        "bg-[#0a0a0a]/80 backdrop-blur-2xl border-b border-white/[0.06]",
        "flex items-center justify-between px-4 sm:px-8",
        isMobile ? "left-0 w-full" : sidebarCollapsed ? "left-20 w-[calc(100%-80px)]" : "left-64 w-[calc(100%-256px)]"
      )}
    >
      {/* Left: Mobile Menu & Search */}
      <div className="flex items-center gap-4 flex-1">
        <Button variant="ghost" size="icon" className="lg:hidden text-neutral-400 hover:text-white">
          <Menu className="w-5 h-5" />
        </Button>

        <div className="relative hidden sm:flex items-center flex-1 max-w-[400px] group">
          <Search className="absolute left-3 w-4 h-4 text-neutral-500 group-focus-within:text-blue-400 transition-colors" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search metrics, reports, datasets..."
            className="pl-10 pr-12 bg-white/5 border-white/5 hover:bg-white/[0.08] text-sm text-white placeholder:text-neutral-500 h-10 rounded-xl transition-all border-none focus-visible:ring-1 focus-visible:ring-blue-500/50"
          />
          <div className="absolute right-3 px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-[10px] text-neutral-500 font-mono pointer-events-none group-focus-within:opacity-0 transition-opacity">
            ⌘K
          </div>
        </div>
      </div>

      {/* Center: Dataset Status */}
      {datasetName && (
        <div className="hidden xl:flex items-center gap-4">
          <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06]">
             <Sparkles className="w-3.5 h-3.5 text-blue-400" />
             <span className="text-[13px] font-bold text-white tracking-tight">
              {datasetName}
            </span>
            <div className="w-1 h-1 rounded-full bg-neutral-600" />
            <div className="flex items-center gap-1.5">
              {datasetStatus === "processing" && <Loader2 className="w-3 h-3 text-amber-400 animate-spin" />}
              <span className={cn("text-[11px] font-bold uppercase tracking-wider", statusConfig.color)}>
                {statusConfig.label}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 mr-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-neutral-400 hover:text-white hover:bg-white/5 h-9 w-9"       
          >
            <Bell className="w-4.5 h-4.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-neutral-400 hover:text-white hover:bg-white/5 h-9 w-9"       
          >
            {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </Button>
        </div>

        <Button
          onClick={onUploadClick}
          size="sm"
          className="bg-white text-black hover:bg-neutral-200 font-bold h-9 px-4 rounded-xl shadow-lg transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4 mr-1.5 stroke-[3]" />
          <span className="hidden sm:inline">New Dataset</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="border-white/10 bg-white/5 text-neutral-400 hover:text-white h-9 w-9 rounded-xl transition-all"
            >
                <MoreHorizontal className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#141414] border-neutral-800 text-neutral-300 min-w-[200px] p-2 rounded-2xl shadow-2xl">
            <DropdownMenuItem className="rounded-xl focus:bg-white/5 py-2.5">
              <Share2 className="w-4 h-4 mr-2" />
              Share workspace
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl focus:bg-white/5 py-2.5">
              <Download className="w-4 h-4 mr-2" />
              Export data
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/5 my-1" />
            <DropdownMenuItem className="rounded-xl focus:bg-red-500/10 focus:text-red-400 text-red-500/80 py-2.5">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
}

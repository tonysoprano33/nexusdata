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
  Sparkles,
  Command,
  LayoutGrid
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface TopNavbarProps {
  sidebarCollapsed: boolean;
  datasetName?: string;
  datasetStatus?: "processing" | "completed" | "failed";
  onUploadClick?: () => void;
}

export function TopNavbar({
  sidebarCollapsed,
  datasetName,
  datasetStatus,
  onUploadClick,
}: TopNavbarProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const statusMap = {
    processing: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "Neural Mapping" },
    completed: { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Live Node" },
    failed: { color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", label: "System Error" },
    default: { color: "text-zinc-500", bg: "bg-white/[0.03]", border: "border-white/[0.05]", label: "Standby" }
  };

  const status = datasetStatus ? statusMap[datasetStatus] : statusMap.default;

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={cn(
        "fixed top-0 right-0 z-40 h-20 transition-all duration-500",
        "bg-[#030303]/60 backdrop-blur-xl border-b border-white/[0.05]",
        "flex items-center justify-between px-8",
        isMobile ? "left-0 w-full" : sidebarCollapsed ? "left-[88px] w-[calc(100%-88px)]" : "left-[280px] w-[calc(100%-280px)]"
      )}
    >
      <div className="flex items-center gap-6 flex-1">
        <Button variant="ghost" size="icon" className="lg:hidden text-zinc-500 hover:text-white">
          <Menu className="w-5 h-5" />
        </Button>

        <div className="relative hidden sm:flex items-center flex-1 max-w-[440px] group">
          <div className="absolute left-4 w-4 h-4 text-zinc-500 group-focus-within:text-blue-500 transition-colors z-10">
            <Search className="w-4 h-4" />
          </div>
          <Input
            placeholder="Search datasets, neural models, insights..."
            className="pl-12 pr-12 bg-white/[0.03] border-white/[0.05] hover:bg-white/[0.05] focus:bg-white/[0.08] text-xs font-medium text-white placeholder:text-zinc-500 h-11 rounded-2xl transition-all outline-none ring-0 focus-visible:ring-1 focus-visible:ring-blue-500/30"
          />
          <div className="absolute right-4 px-1.5 py-0.5 rounded-lg border border-white/10 bg-white/5 text-[9px] font-black text-zinc-500 tracking-tighter pointer-events-none uppercase">
            ⌘K
          </div>
        </div>
      </div>

      {datasetName && (
        <div className="hidden xl:flex items-center gap-3 absolute left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-3 px-5 py-2 rounded-2xl bg-white/[0.03] border border-white/[0.05] shadow-2xl">
             <div className={cn("w-1.5 h-1.5 rounded-full", datasetStatus === "processing" ? "bg-amber-400 animate-pulse" : datasetStatus === "completed" ? "bg-emerald-500" : "bg-zinc-600")} />
             <span className="text-xs font-black text-white uppercase tracking-widest">{datasetName}</span>
             <div className="w-px h-3 bg-white/[0.1]" />
             <span className={cn("text-[10px] font-black uppercase tracking-[0.2em]", status.color)}>{status.label}</span>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 mr-2">
          <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white hover:bg-white/[0.05] h-10 w-10 rounded-xl">
            <Bell className="w-4.5 h-4.5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-white hover:bg-white/[0.05] h-10 w-10 rounded-xl">
             <LayoutGrid className="w-4.5 h-4.5" />
          </Button>
        </div>

        <Button
          onClick={onUploadClick}
          className="bg-white text-black hover:bg-zinc-200 font-black text-[10px] uppercase tracking-widest h-10 px-6 rounded-2xl shadow-xl shadow-white/5 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4 mr-2 stroke-[3]" /> Ingest
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="border-white/[0.08] bg-white/[0.03] text-zinc-400 hover:text-white h-10 w-10 rounded-xl">
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-[#080808]/90 backdrop-blur-2xl border-white/[0.08] text-zinc-400 min-w-[220px] p-2 rounded-2xl shadow-2xl z-[60]">
            <DropdownMenuItem className="rounded-xl focus:bg-white/[0.05] py-3 text-xs font-bold uppercase tracking-widest cursor-pointer">
              <Share2 className="w-4 h-4 mr-3" /> Broadcast Node
            </DropdownMenuItem>
            <DropdownMenuItem className="rounded-xl focus:bg-white/[0.05] py-3 text-xs font-bold uppercase tracking-widest cursor-pointer">
              <Download className="w-4 h-4 mr-3" /> Extract Data
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/[0.05] my-1" />
            <DropdownMenuItem className="rounded-xl focus:bg-rose-500/10 focus:text-rose-400 text-rose-500/80 py-3 text-xs font-bold uppercase tracking-widest cursor-pointer">
              Terminate Session
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  );
}

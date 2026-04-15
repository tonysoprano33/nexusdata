"use client";
import { Search, Bell, Plus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function TopNavbar({
  sidebarCollapsed,
  datasetName,
  datasetStatus,
}: {
  sidebarCollapsed: boolean;
  datasetName?: string;
  datasetStatus?: string;
}) {
  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-40 h-14 bg-black/80 backdrop-blur-md border-b border-zinc-900 transition-all duration-300 flex items-center justify-between px-8",
        sidebarCollapsed ? "left-16 w-[calc(100%-64px)]" : "left-60 w-[calc(100%-240px)]"
      )}
    >
      <div className="flex items-center gap-6 flex-1">
        <div className="relative flex items-center max-w-sm w-full group">
          <Search className="absolute left-3 w-3.5 h-3.5 text-zinc-600 group-focus-within:text-white transition-colors" />
          <Input
            placeholder="Search manifests..."
            className="pl-9 bg-zinc-950 border-zinc-900 h-9 text-xs font-medium placeholder:text-zinc-600 rounded-sm focus:border-zinc-700 outline-none ring-0 focus-visible:ring-0"
          />
        </div>
      </div>

      {datasetName && (
        <div className="flex items-center gap-3 px-4 h-9 bg-zinc-900 border border-zinc-800 rounded-sm">
           <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Node:</span>
           <span className="text-[11px] font-bold text-white uppercase tracking-tight">{datasetName}</span>
           <div className="w-px h-3 bg-zinc-800" />
           <span className={cn("text-[10px] font-bold uppercase tracking-widest", datasetStatus === "completed" ? "text-emerald-500" : "text-amber-500")}>
            {datasetStatus || "Standby"}
           </span>
        </div>
      )}

      <div className="flex items-center gap-4 ml-6">
        <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-500 hover:text-white hover:bg-zinc-900">
          <Bell className="w-4 h-4" />
        </Button>
        <Button className="bg-white text-black hover:bg-zinc-200 font-bold text-[11px] uppercase tracking-widest h-9 px-4 rounded-sm">
          <Plus className="w-4 h-4 mr-2" /> Ingest
        </Button>
      </div>
    </header>
  );
}

"use client";
import { useState, useEffect } from "react";
import { EnterpriseSidebar } from "@/components/layout/EnterpriseSidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { AnalysisHistory } from "@/components/landing/AnalysisHistory";
import { Card, CardHeader, CardTitle, CardInsight } from "@/components/ui/card";
import {
  Database,
  Plus,
  LayoutGrid,
  List,
  Sparkles,
  BarChart3,
  FileSearch,
  ArrowRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type ViewMode = "grid" | "list";

function ViewToggle({ value, onChange }: { value: ViewMode; onChange: (v: ViewMode) => void }) {
  return (
    <div className="flex items-center bg-zinc-950/50 p-1 rounded-xl border border-white/[0.08] backdrop-blur-md gap-1">      
      {(["grid", "list"] as ViewMode[]).map((mode) => {
        const Icon = mode === "grid" ? LayoutGrid : List;
        const active = value === mode;
        return (
          <button
            key={mode}
            onClick={() => onChange(mode)}
            className={cn(
              "h-8 px-3 rounded-lg flex items-center gap-2 text-xs font-bold transition-all duration-300",
              active
                ? "bg-white text-black shadow-lg shadow-white/5"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03]"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="capitalize">{mode}</span>
          </button>
        );
      })}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, trend, color = "blue" }: any) {
  const colors = {
    blue: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    indigo: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  };

  return (
    <Card className="flex-1">
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-2 rounded-xl border", colors[color as keyof typeof colors])}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className="px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
            {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-3xl font-bold tracking-tight text-white mb-1">{value}</p>
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500">{label}</p>
      </div>
      <CardInsight label="System Status" className="mt-6">
        Verified Integrity
      </CardInsight>
    </Card>
  );
}

export default function DatasetsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setSidebarCollapsed(true);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-[#030303] text-white">
      {!isMobile && (
        <EnterpriseSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      )}

      <TopNavbar
        sidebarCollapsed={sidebarCollapsed}
        datasetName="Inventory"
        onUploadClick={() => router.push("/")}
      />

      <main
        className={cn(
          "pt-[72px] min-h-screen transition-all duration-500 ease-in-out",
          isMobile ? "ml-0" : sidebarCollapsed ? "ml-20" : "ml-64"
        )}
      >
        <div className="px-6 lg:px-12 py-10 max-w-[1600px] mx-auto w-full">
          
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 mb-12"
          >    
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Database className="text-white w-6 h-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">
                  Data Command Center
                </h1>
                <p className="text-zinc-500 text-sm font-medium mt-1">
                  Orchestrate and analyze your enterprise data ecosystem.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full xl:w-auto">
              <ViewToggle value={viewMode} onChange={setViewMode} />
              <button
                onClick={() => router.push("/")}
                className="group flex items-center gap-2 px-6 py-2.5 bg-white text-black text-sm font-bold rounded-xl hover:bg-zinc-200 active:scale-95 transition-all shadow-xl shadow-white/5 ml-auto xl:ml-0"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                Ingest Data
                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
            <StatCard icon={Database} label="Connected Sources" value="12" trend="+2 New" color="blue" />
            <StatCard icon={BarChart3} label="Neural Extractions" value="482" trend="98% Acc" color="indigo" />
            <StatCard icon={Sparkles} label="Strategic Insights" value="1.2k" trend="High Signal" color="emerald" />
          </div>

          <div className="relative group rounded-[2.5rem] p-[1px] bg-gradient-to-b from-white/[0.08] to-transparent shadow-2xl overflow-hidden"> 
            <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-xl rounded-[2.5rem] m-[1px]" />
            <div className="relative">
              <AnalysisHistory
                hideHeader
                viewMode={viewMode}
                emptyState={
                  <div className="flex flex-col items-center justify-center py-32 opacity-50">
                    <FileSearch className="w-12 h-12 mb-4 text-zinc-600" />
                    <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">No Data Streams Detected</p>
                  </div>
                }
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

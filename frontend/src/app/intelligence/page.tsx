"use client";
import { useState, useEffect } from "react";
import { EnterpriseSidebar } from "@/components/layout/EnterpriseSidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { Brain, Sparkles, TrendingUp, Zap, MessageCircle, ArrowRight, ShieldCheck, Cpu, LayoutDashboard, Database, ChevronRight, Binary } from "lucide-react";
import { Card, CardInsight } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function IntelligencePage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setSidebarCollapsed(mobile);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-[#030303] text-white">
      {!isMobile && (
        <EnterpriseSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      )}

      <TopNavbar sidebarCollapsed={sidebarCollapsed} datasetName="Neural Hub" datasetStatus="completed" />

      <main className={cn(
        "pt-24 min-h-screen transition-all duration-500 ease-in-out",
        isMobile ? "ml-0" : sidebarCollapsed ? "ml-20" : "ml-64"
      )}>
        <div className="px-6 lg:px-12 py-10 max-w-[1600px] mx-auto w-full">

          {/* Breadcrumbs */}
          <nav className="flex items-center gap-3 mb-12 px-2">
            <div className="p-2 bg-white/[0.03] rounded-xl border border-white/[0.08] text-zinc-500">      
              <Brain className="w-4 h-4 text-blue-500" />
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-800" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Core Engine</span>
            <ChevronRight className="w-4 h-4 text-zinc-800" />
            <span className="text-xs font-black uppercase tracking-[0.2em] text-white">Intelligence Hub</span>
          </nav>

          {/* Hero Section: The "All-Black" Crown */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-16 p-12 sm:p-20 rounded-[3rem] bg-gradient-to-br from-zinc-950/80 to-black border border-white/[0.08] overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            
            <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-16">
              <div className="max-w-3xl space-y-8 text-center xl:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Active Intelligence Node</span>
                </div>
                <h1 className="text-5xl sm:text-6xl xl:text-7xl font-black tracking-tighter leading-[0.9] text-white">
                  Neural <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Synthesis Hub</span>
                </h1>
                <p className="text-lg text-zinc-400 font-medium leading-relaxed max-w-xl mx-auto xl:mx-0">
                  Unlock hidden patterns and global business correlations across all your data streams using our next-generation neural interface.
                </p>
                <div className="flex flex-wrap justify-center xl:justify-start gap-4 pt-4">
                  <Button
                    onClick={() => router.push("/datasets")}
                    className="bg-white text-black hover:bg-zinc-200 font-black h-12 px-10 rounded-2xl shadow-2xl shadow-white/5 active:scale-95 transition-all uppercase tracking-widest text-[11px]"
                  >
                    Select Stream
                  </Button>
                  <Button
                    onClick={() => router.push("/")}
                    variant="ghost" className="text-zinc-400 hover:text-white font-black h-12 px-10 rounded-2xl uppercase tracking-widest text-[11px] hover:bg-white/[0.03]"
                  >
                    Core Methodology
                  </Button>
                </div>
              </div>

              <div className="flex-shrink-0 w-72 h-72 sm:w-96 sm:h-96 relative group">
                <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-[100px] group-hover:bg-blue-500/20 transition-all duration-700" />    
                <div className="relative w-full h-full bg-zinc-950/50 border border-white/[0.08] backdrop-blur-3xl rounded-[4rem] shadow-2xl flex items-center justify-center transition-transform duration-700 group-hover:scale-105">
                   <div className="absolute inset-0 flex items-center justify-center opacity-10">
                      <Binary className="w-full h-full p-12 text-blue-500 animate-pulse" />
                   </div>
                  <Brain className="w-32 h-32 text-blue-400 relative z-10 drop-shadow-[0_0_40px_rgba(59,130,246,0.3)]" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid: Reusing our high-tech Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {[
              { label: "Neural Clusters", value: "842", trend: "High Signal", icon: Sparkles, color: "text-blue-400" },
              { label: "Extraction Gain", value: "+32%", trend: "Optimized", icon: TrendingUp, color: "text-purple-400" },
              { label: "Response Latency", value: "1.2s", trend: "Real-time", icon: Zap, color: "text-amber-400" },
              { label: "Node Integrity", value: "99.9%", trend: "Verified", icon: ShieldCheck, color: "text-emerald-400" }
            ].map((stat, i) => (
              <Card key={i} className="group">
                <div className="flex items-start justify-between mb-6">
                  <div className={cn("p-2.5 rounded-xl border bg-white/[0.03] border-white/[0.08] transition-all duration-500 group-hover:scale-110", stat.color)}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div className="px-2 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-[9px] font-black uppercase tracking-widest text-zinc-500">
                    {stat.trend}
                  </div>
                </div>
                <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2">{stat.label}</h3>
                <div className="text-4xl font-black text-white tracking-tighter mb-4">{stat.value}</div>
                <CardInsight label="Telemetry" className="mt-4">Active & Synced</CardInsight>
              </Card>
            ))}
          </div>

          {/* Functional Sections: Auto-Discovery & Chat */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <Card className="p-12 sm:p-16 flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-[2rem] bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-500">
                <MessageCircle className="w-12 h-12 text-blue-400" />
              </div>
              <div className="space-y-4 mb-10">
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Neural Interface</h3>
                <p className="text-zinc-500 text-sm max-w-sm font-medium leading-relaxed">
                  Direct communication with your enterprise data ecosystem. Execute cross-node queries in plain language.
                </p>
              </div>
              <Button
                onClick={() => router.push("/datasets")}
                className="bg-blue-600 hover:bg-blue-500 text-white font-black h-12 px-12 rounded-2xl w-full sm:w-auto shadow-2xl shadow-blue-500/20 active:scale-95 transition-all uppercase tracking-widest text-[11px]"
              >
                Launch Interface
              </Button>
            </Card>

            <Card className="p-12 sm:p-16 flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-[2rem] bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all duration-500">
                <Cpu className="w-12 h-12 text-purple-400" />
              </div>
              <div className="space-y-4 mb-10">
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Autonomous Discovery</h3>       
                <p className="text-zinc-500 text-sm max-w-sm font-medium leading-relaxed">
                  Proactive background engine scanning for market shifts, anomalous signals, and strategic growth nodes.
                </p>
              </div>
              <Button
                onClick={() => router.push("/datasets")}
                variant="ghost" className="text-zinc-400 hover:text-white border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] font-black h-12 px-12 rounded-2xl w-full sm:w-auto transition-all uppercase tracking-widest text-[11px]"
              >
                Initialize Scan
              </Button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

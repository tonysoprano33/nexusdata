"use client";
import { useState, useEffect } from "react";
import { EnterpriseSidebar } from "@/components/layout/EnterpriseSidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { Brain, Sparkles, TrendingUp, Zap, MessageCircle, ArrowRight, ShieldCheck, Cpu, LayoutDashboard, Database, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

export default function IntelligencePage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
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
    <div className="min-h-screen bg-[#060606] text-white selection:bg-indigo-500/30">
      <div className={cn("transition-all duration-300", isMobile ? "hidden" : "block")}>
        <EnterpriseSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      </div>

      <TopNavbar sidebarCollapsed={sidebarCollapsed} datasetName="Intelligence Hub" datasetStatus="completed" />

      <main 
        className={cn(
          "pt-24 min-h-screen transition-all duration-300 ease-in-out",
          isMobile ? "ml-0" : sidebarCollapsed ? "ml-20" : "ml-64"
        )}
      >  
        <div className="p-4 sm:p-8 lg:p-10 max-w-[1400px] mx-auto w-full">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 mb-8 text-neutral-500">
            <div className="p-1.5 bg-neutral-900 rounded-md border border-neutral-800">
              <Brain className="w-4 h-4 text-indigo-400" />
            </div>
            <ChevronRight className="w-4 h-4 opacity-30" />
            <span className="text-[13px] font-medium text-neutral-400">Core Engine</span>
            <ChevronRight className="w-4 h-4 opacity-30" />
            <span className="text-[13px] font-bold text-white tracking-tight">Intelligence Hub</span>
          </div>

          {/* Hero Section */}
          <div className="relative mb-12 p-8 sm:p-12 rounded-[2.5rem] bg-[#0f0f0f] border border-neutral-800/60 overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-indigo-600/15 transition-colors duration-700" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between gap-12 text-center xl:text-left">
              <div className="max-w-2xl space-y-6">
                <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 px-4 py-1 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
                  <Sparkles className="w-3.5 h-3.5 mr-2" />
                  Next-Gen Intelligence Hub
                </Badge>
                <h1 className="text-4xl sm:text-5xl xl:text-6xl font-black tracking-tight leading-[1.1] text-white">
                  Cross-Dataset <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Neural Synthesis</span>
                </h1>
                <p className="text-lg sm:text-xl text-neutral-400 font-medium leading-relaxed max-w-xl mx-auto xl:mx-0">
                  Unlock hidden patterns and global business correlations across all your data sources using our advanced Gemini-powered engine.
                </p>
                <div className="flex flex-wrap justify-center xl:justify-start gap-4 pt-4">
                  <Button 
                    onClick={() => router.push("/datasets")}
                    className="bg-white text-black hover:bg-neutral-200 font-bold h-12 px-8 rounded-2xl shadow-xl shadow-white/5 active:scale-95 transition-all"
                  >
                    Select Dataset
                  </Button>
                  <Button 
                    onClick={() => router.push("/")}
                    variant="outline" className="border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800 text-white font-bold h-12 px-8 rounded-2xl transition-all"
                  >
                    Methodology
                  </Button>
                </div>
              </div>

              <div className="flex-shrink-0 w-64 h-64 sm:w-80 sm:h-80 relative">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-[80px] animate-pulse" />
                <div className="relative w-full h-full bg-neutral-900 border border-neutral-800/50 rounded-[3rem] shadow-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
                  <Brain className="w-24 h-24 sm:w-32 sm:h-32 text-indigo-400 drop-shadow-[0_0_30px_rgba(99,102,241,0.4)]" />
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { label: "Neural Patterns", value: "842", sub: "Discovered this month", icon: Sparkles, color: "text-indigo-400", bg: "bg-indigo-500/10" },
              { label: "Efficiency Boost", value: "+32%", sub: "Avg. optimization gain", icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-500/10" },
              { label: "Processing Latency", value: "1.2s", sub: "Ultra-fast response", icon: Zap, color: "text-amber-400", bg: "bg-amber-500/10" },
              { label: "Data Integrity", value: "99.9%", sub: "Validation score", icon: ShieldCheck, color: "text-emerald-400", bg: "bg-emerald-500/10" }
            ].map((stat, i) => (
              <Card key={i} className="bg-[#0f0f0f] border-neutral-800/60 p-6 rounded-3xl group hover:border-indigo-500/30 transition-all duration-300">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", stat.bg)}>
                  <stat.icon className={cn("w-5 h-5", stat.color)} />
                </div>
                <h3 className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest mb-1">{stat.label}</h3>
                <div className="text-3xl font-black text-white tracking-tight mb-1">{stat.value}</div>
                <p className="text-[12px] text-neutral-500 font-medium">{stat.sub}</p>
              </Card>
            ))}
          </div>

          {/* Functional Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-[#0f0f0f] border-neutral-800/60 p-10 rounded-[2.5rem] group hover:border-indigo-500/20 transition-all duration-500 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent"></div>
              <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 rounded-[1.5rem] bg-indigo-500/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-500">    
                  <MessageCircle className="w-10 h-10 text-indigo-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white tracking-tight">Global Neural Chat</h3>
                  <p className="text-neutral-500 text-sm max-w-sm font-medium leading-relaxed">
                    Communicate with your entire data ecosystem. Ask complex questions that require context from multiple sources.
                  </p>
                </div>
                <Button 
                  onClick={() => router.push("/datasets")}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-12 px-8 rounded-2xl w-full sm:w-auto shadow-xl shadow-indigo-500/10 active:scale-95 transition-all"
                >
                  Launch Neural Interface
                </Button>
              </div>
            </Card>

            <Card className="bg-[#0f0f0f] border-neutral-800/60 p-10 rounded-[2.5rem] group hover:border-blue-500/20 transition-all duration-500 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
              <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 rounded-[1.5rem] bg-blue-500/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-500/20 transition-all duration-500">      
                  <Cpu className="w-10 h-10 text-blue-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white tracking-tight">Autonomous Discovery</h3>
                  <p className="text-neutral-500 text-sm max-w-sm font-medium leading-relaxed">
                    Set our background engine to proactively scan for market opportunities, risks, and statistical anomalies.
                  </p>
                </div>
                <Button 
                  onClick={() => router.push("/datasets")}
                  variant="outline" className="border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800 text-white font-bold h-12 px-8 rounded-2xl w-full sm:w-auto transition-all"
                >
                  Initialize Discovery Scan
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { EnterpriseSidebar } from "@/components/layout/EnterpriseSidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { Brain, Sparkles, TrendingUp, Zap, MessageCircle, ArrowRight, ShieldCheck, Cpu, Database, ChevronRight, Activity, Terminal } from "lucide-react";
import { Card, CardInsight } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
    <div className="min-h-screen bg-black text-white">
      {!isMobile && (
        <EnterpriseSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      )}

      <TopNavbar sidebarCollapsed={sidebarCollapsed} datasetName="Neural Hub" />

      <main className={cn(
        "pt-20 min-h-screen transition-all duration-300",
        isMobile ? "ml-0" : sidebarCollapsed ? "ml-16" : "ml-60"
      )}>
        <div className="px-10 py-10 max-w-6xl mx-auto w-full">

          {/* Technical Header */}
          <div className="mb-20 pb-20 border-b border-zinc-900 space-y-8">
            <div className="flex items-center gap-3">
              <Terminal className="w-5 h-5 text-zinc-600" />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-700">Neural Node Architecture</span>
            </div>
            <h1 className="text-7xl font-black tracking-tighter leading-[0.8] uppercase italic">
              Strategy <br /> Synthesis
            </h1>
            <p className="text-xl text-zinc-600 font-medium leading-relaxed max-w-2xl">
              Execute cross-dataset neural scans. Identify correlations and anomalous strategic shifts across your entire enterprise manifest.
            </p>
          </div>

          {/* High-Contrast Technical Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-zinc-900 border border-zinc-900">
            
            <div className="bg-black p-16 space-y-10 group hover:bg-zinc-950/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-sm border border-zinc-800 flex items-center justify-center bg-black group-hover:bg-white group-hover:text-black transition-all">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black tracking-tighter uppercase">Autonomous Discovery</h3>
              </div>
              <p className="text-zinc-500 text-sm leading-relaxed font-medium">
                Proactive neural scanning for market shifts, anomalous signals, and strategic growth nodes across disconnected data streams.
              </p>
              <Button onClick={() => router.push("/datasets")} className="w-full h-12 bg-white text-black font-black text-[11px] uppercase tracking-widest rounded-none shadow-2xl">
                Initialize Scan Protocol
              </Button>
            </div>

            <div className="bg-black p-16 space-y-10 group hover:bg-zinc-950/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-sm border border-zinc-800 flex items-center justify-center bg-black group-hover:bg-white group-hover:text-black transition-all">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black tracking-tighter uppercase">Neural Interface</h3>
              </div>
              <p className="text-zinc-500 text-sm leading-relaxed font-medium">
                Natural language query protocol. Execute complex strategic queries requiring cross-node context and secure manifest integrity.
              </p>
              <Button variant="outline" onClick={() => router.push("/datasets")} className="w-full h-12 border-zinc-800 text-white font-black text-[11px] uppercase tracking-widest rounded-none hover:bg-zinc-900">
                Launch Interface
              </Button>
            </div>

          </div>

          {/* Node Health / Stats */}
          <div className="mt-24 grid grid-cols-2 lg:grid-cols-4 gap-16 border-t border-zinc-900 pt-16">
            {[
              { label: "Neural Patterns", value: "842", icon: Activity },
              { label: "Extraction gain", value: "+32%", icon: TrendingUp },
              { label: "Sync Latency", value: "1.2s", icon: Zap },
              { label: "Node Integrity", value: "99.9%", icon: ShieldCheck }
            ].map((stat, i) => (
              <div key={i} className="space-y-4">
                <div className="flex items-center gap-2 text-zinc-700">
                  <stat.icon className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</span>
                </div>
                <p className="text-4xl font-black tracking-tighter">{stat.value}</p>
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}

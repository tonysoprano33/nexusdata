"use client";
import { useState, useEffect } from "react";
import { EnterpriseSidebar } from "@/components/layout/EnterpriseSidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { Brain, Sparkles, TrendingUp, Zap, MessageCircle, ArrowRight, ShieldCheck, Cpu, Database, ChevronRight, Activity, Terminal } from "lucide-react";
import { Card, CardInsight } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import axios from "axios";
import { buildApiUrl, type PortfolioMetrics } from "@/lib/api";

const defaultMetrics: PortfolioMetrics = {
  analyses_total: 0,
  analyses_completed: 0,
  analyses_failed: 0,
  rows_processed: 0,
  columns_profiled: 0,
  charts_generated: 0,
  avg_quality_score: 0,
  advanced_signals: {
    churn: 0,
    rfm: 0,
    predictions: 0,
    clustering: 0,
  },
  capabilities: [
    "CSV, Excel and JSON ingestion",
    "Automated data cleaning and quality scoring",
    "AI-assisted executive insights with fallback mode",
    "Chart recommendation, dataset chat and exports",
  ],
};

export default function IntelligencePage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [metrics, setMetrics] = useState<PortfolioMetrics>(defaultMetrics);
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

  useEffect(() => {
    axios
      .get<PortfolioMetrics>(buildApiUrl("/api/portfolio/metrics"))
      .then((response) => setMetrics(response.data))
      .catch(() => setMetrics(defaultMetrics));
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
        <div className="px-6 sm:px-10 py-10 max-w-6xl mx-auto w-full">

          {/* Technical Header */}
          <div className="mb-20 pb-20 border-b border-zinc-900 space-y-8">
            <div className="flex items-center gap-3">
              <Terminal className="w-5 h-5 text-zinc-600" />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-700">Portfolio-grade automation architecture</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.88] uppercase italic max-w-full overflow-hidden">
              Project <br /> Intelligence
            </h1>
            <p className="text-xl text-zinc-600 font-medium leading-relaxed max-w-2xl">
              A live control room for the project itself: processed datasets, generated charts, quality scoring, ML signals and analyst-ready exports.
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
                Upload raw files and let the pipeline parse, clean, profile, score, visualize and summarize them with an analyst workflow.
              </p>
              <Button onClick={() => router.push("/datasets")} className="w-full h-12 bg-white text-black font-black text-[11px] uppercase tracking-widest rounded-none shadow-2xl">
                Analyze Dataset
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
                Ask follow-up questions about a dataset, export PDF/PPTX reports and keep analysis history available for review.
              </p>
              <Button variant="outline" onClick={() => router.push("/datasets")} className="w-full h-12 border-zinc-800 text-white font-black text-[11px] uppercase tracking-widest rounded-none hover:bg-zinc-900">
                Open Datasets
              </Button>
            </div>

          </div>

          {/* Node Health / Stats */}
          <div className="mt-24 grid grid-cols-2 lg:grid-cols-4 gap-16 border-t border-zinc-900 pt-16">
            {[
              { label: "Analyses", value: metrics.analyses_completed.toLocaleString(), icon: Activity },
              { label: "Rows processed", value: metrics.rows_processed.toLocaleString(), icon: Database },
              { label: "Charts generated", value: metrics.charts_generated.toLocaleString(), icon: TrendingUp },
              { label: "Avg quality", value: `${metrics.avg_quality_score}%`, icon: ShieldCheck }
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

          <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-10">
              <div className="flex items-center gap-3 mb-8">
                <Sparkles className="w-5 h-5 text-zinc-500" />
                <h2 className="text-sm font-black uppercase tracking-[0.2em]">What this proves</h2>
              </div>
              <div className="space-y-4">
                {metrics.capabilities.map((capability) => (
                  <div key={capability} className="flex items-start gap-3 text-sm text-zinc-400">
                    <ChevronRight className="w-4 h-4 mt-0.5 text-zinc-700 shrink-0" />
                    <span>{capability}</span>
                  </div>
                ))}
              </div>
              <CardInsight label="CV signal" className="mt-8">
                Full-stack analytics product: API design, data pipelines, ML heuristics, BI UX, export automation and deploy configuration.
              </CardInsight>
            </Card>

            <Card className="p-10">
              <div className="flex items-center gap-3 mb-8">
                <Brain className="w-5 h-5 text-zinc-500" />
                <h2 className="text-sm font-black uppercase tracking-[0.2em]">Advanced signals</h2>
              </div>
              <div className="grid grid-cols-2 gap-px bg-zinc-900 border border-zinc-900">
                {[
                  ["Churn", metrics.advanced_signals.churn],
                  ["RFM", metrics.advanced_signals.rfm],
                  ["Predictions", metrics.advanced_signals.predictions],
                  ["Clustering", metrics.advanced_signals.clustering],
                ].map(([label, value]) => (
                  <div key={label} className="bg-black p-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-600">{label}</p>
                    <p className="text-3xl font-black mt-2">{value}</p>
                  </div>
                ))}
              </div>
              <CardInsight label="Automation depth" className="mt-8">
                The backend chooses applicable analytics based on the dataset schema instead of showing static demo content.
              </CardInsight>
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
}

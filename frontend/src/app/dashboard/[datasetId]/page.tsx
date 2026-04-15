"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { EnterpriseSidebar } from "@/components/layout/EnterpriseSidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { KPIGrid } from "@/components/dashboard/KPIGrid";
import { ChartsGrid } from "@/components/dashboard/ChartsGrid";
import { AdvancedAnalyticsPanel } from "@/components/dashboard/AdvancedAnalyticsPanel";
import { ChatDataset } from "@/components/dashboard/ChatDataset";
import { AIInsightsPanel } from "../AIInsightsPanel";
import { Card, CardInsight } from "@/components/ui/card";
import {
  Loader2,
  AlertCircle,
  LayoutDashboard,
  ChevronRight,
  RefreshCw,
  Cpu,
  BarChart3,
  MessageSquare,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Binary,
} from "lucide-react";
import type { AnalysisResponse } from "@/types/analysis";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://nexusdata-api.onrender.com";

function DashboardSection({
  id,
  icon: Icon,
  title,
  subtitle,
  accent = false,
  children,
}: {
  id?: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  accent?: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        "relative rounded-[2rem] border p-8 transition-all duration-500",
        accent
          ? "bg-blue-600/[0.03] border-blue-500/20 shadow-[0_0_80px_-20px_rgba(59,130,246,0.15)]"
          : "bg-zinc-950/40 border-white/[0.06] backdrop-blur-md"
      )}
    >
      <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center border transition-transform duration-500 group-hover:scale-110",
          accent ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-white/[0.03] border-white/[0.08] text-zinc-400"
        )}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white">{title}</h2>
          <p className="text-zinc-500 text-sm font-medium mt-1">{subtitle}</p>
        </div>
        {accent && (
          <div className="md:ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Neural Mode Active</span>
          </div>
        )}
      </div>
      <div className="relative z-10">{children}</div>
    </motion.section>
  );
}

function ProcessingState() {
  const steps = ["Mapping architecture", "Neural cleaning", "Detecting anomalies", "Synthesizing insights", "Rendering data"];
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setStep((s) => (s + 1) % steps.length), 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-12 text-center">
      <div className="relative w-32 h-32">
        <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="relative w-32 h-32 rounded-full border-2 border-white/[0.05] flex items-center justify-center overflow-hidden">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-t-2 border-blue-500 rounded-full"
          />
          <Cpu className="w-10 h-10 text-blue-400" />
        </div>
      </div>
      <div className="space-y-4">
        <h3 className="text-2xl font-bold tracking-tight text-white uppercase tracking-[0.2em]">Neural Synthesis In Progress</h3>
        <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">{steps[step]}...</p>
      </div>
      <div className="flex gap-2">
        {steps.map((_, i) => (
          <div key={i} className={cn("h-1 rounded-full transition-all duration-500", i === step ? "bg-blue-500 w-8" : "bg-white/[0.05] w-4")} />
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { datasetId } = useParams<{ datasetId: string }>();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

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

  const fetchAnalysis = async () => {
    if (!datasetId) return;
    try {
      const { data } = await axios.get(`${API_URL}/api/datasets/${datasetId}`);
      setAnalysis(data);
      if (data.status === "processing") setTimeout(fetchAnalysis, 3000);
    } catch {
      setError("Strategic data extraction failed. Please verify source integrity.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalysis(); }, [datasetId]);

  const result = analysis?.result;

  return (
    <div className="min-h-screen bg-[#030303] text-white">
      {!isMobile && (
        <EnterpriseSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      )}

      <TopNavbar
        sidebarCollapsed={sidebarCollapsed}
        datasetName={analysis?.filename || "Strategic Dashboard"}
        datasetStatus={analysis?.status || "processing"}
        onUploadClick={() => router.push("/")}
      />

      <main className={cn(
        "pt-[72px] min-h-screen transition-all duration-500 ease-in-out",
        isMobile ? "ml-0" : sidebarCollapsed ? "ml-20" : "ml-64"
      )}>
        <div className="px-6 lg:px-12 py-10 max-w-[1600px] mx-auto w-full">
          
          {!loading && !error && (
            <nav className="flex items-center gap-3 mb-10 px-4">
              <div className="p-2 bg-white/[0.03] rounded-xl border border-white/[0.08] text-zinc-500">      
                <LayoutDashboard className="w-4 h-4" />
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-800" />
              <button onClick={() => router.push("/datasets")} className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-colors">
                Inventory
              </button>
              <ChevronRight className="w-4 h-4 text-zinc-800" />
              <span className="text-xs font-bold uppercase tracking-widest text-white truncate max-w-[300px]">
                {analysis?.filename || datasetId}
              </span>
              <div className="ml-auto flex gap-4">
                 <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05]">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Secure Node</span>
                </div>
              </div>
            </nav>
          )}

          {loading ? (
            <div className="space-y-8 animate-pulse">
              <div className="h-64 bg-white/[0.02] rounded-[2rem] border border-white/[0.05]" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white/[0.02] rounded-2xl border border-white/[0.05]" />)}
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-8">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-xl font-bold tracking-tight text-white">{error}</h3>
              <button onClick={fetchAnalysis} className="flex items-center gap-2 px-6 py-2.5 bg-white text-black text-sm font-bold rounded-xl hover:bg-zinc-200 transition-all">
                <RefreshCw className="w-4 h-4" /> Retry Connection
              </button>
            </div>
          ) : analysis?.status === "processing" ? (
            <ProcessingState />
          ) : (
            <div className="space-y-12 pb-24">
              {result?.business_insights && (
                <DashboardSection id="insights" icon={Sparkles} title="Neural Intelligence" subtitle="AI-driven insights for strategic decision making" accent>
                  <AIInsightsPanel insights={result.business_insights} />
                </DashboardSection>
              )}

              <DashboardSection id="summary" icon={TrendingUp} title="Strategic Summary" subtitle="Key metrics and executive performance indicators">
                <KPIGrid summary={result?.summary} anomaly_detection={result?.anomaly_detection} column_types={result?.column_types} />
              </DashboardSection>

              <DashboardSection id="charts" icon={BarChart3} title="Data Visualizations" subtitle="High-fidelity visual analysis of distributions and trends">
                <ChartsGrid charts_data={result?.charts_data} />
              </DashboardSection>

              {result?.advanced_analytics && (
                <DashboardSection id="advanced" icon={Cpu} title="Predictive Engines" subtitle="Advanced statistical forecasting and ML models">
                  <AdvancedAnalyticsPanel data={result.advanced_analytics} />
                </DashboardSection>
              )}

              <DashboardSection id="chat" icon={MessageSquare} title="Neural Interface" subtitle="Interactive natural language query system for your data">
                <ChatDataset datasetId={datasetId} />
              </DashboardSection>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

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
import { Card } from "@/components/ui/card";
import { Database, Sparkles, TrendingUp, BarChart3, MessageSquare, Terminal, ChevronRight, Activity, AlertCircle } from "lucide-react";
import type { AnalysisResponse } from "@/types/analysis";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://nexusdata-api.onrender.com";

function TechSection({ id, icon: Icon, title, subtitle, children, accent = false }: any) {
  return (
    <section id={id} className="mb-24">
      <div className="flex items-center gap-4 mb-10 pb-4 border-b border-zinc-900">
        <div className={cn("w-8 h-8 rounded-sm border flex items-center justify-center", accent ? "bg-white text-black border-white" : "bg-black border-zinc-800 text-zinc-600")}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-lg font-black tracking-tighter uppercase">{title}</h2>
          <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.3em] mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div>{children}</div>
    </section>
  );
}

export default function DashboardPage() {
  const params = useParams();
  const datasetId = params?.datasetId as string;
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = async () => {
    if (!datasetId) return;
    try {
      const { data } = await axios.get(`${API_URL}/api/datasets/${datasetId}`);
      setAnalysis(data);
      if (data.status === "processing") {
        setTimeout(fetchAnalysis, 3000);
      }
    } catch (e) { 
      setError("Data stream failed. Verify source integrity.");
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    fetchAnalysis(); 
  }, [datasetId]);

  return (
    <div className="min-h-screen bg-black text-white">
      <EnterpriseSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <TopNavbar sidebarCollapsed={sidebarCollapsed} datasetName={analysis?.filename} datasetStatus={analysis?.status} />

      <main className={cn("pt-20 transition-all duration-300", sidebarCollapsed ? "ml-16" : "ml-60")}>
        <div className="px-10 py-10 max-w-[1600px] mx-auto w-full">
          
          <nav className="flex items-center gap-3 mb-16 text-zinc-600">
            <Terminal className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Neural Manifest</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white underline underline-offset-4">{analysis?.filename || datasetId}</span>
          </nav>

          {loading ? (
             <div className="py-40 text-center opacity-20"><Activity className="w-12 h-12 animate-spin mx-auto mb-4" /><p className="text-xs font-bold uppercase tracking-[0.3em]">Mapping Node Architecture...</p></div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-40 gap-6">
              <AlertCircle className="w-12 h-12 text-zinc-800" />
              <h3 className="text-xl font-bold tracking-tight">{error}</h3>
              <button onClick={fetchAnalysis} className="h-10 px-6 bg-white text-black font-bold uppercase text-xs tracking-widest rounded-sm">Retry Sync</button>
            </div>
          ) : (
            <div className="space-y-32">
              {analysis?.result?.business_insights && (
                <TechSection id="insights" icon={Sparkles} title="Strategic Intelligence" subtitle="AI neural extractions & insight cluster" accent>
                  <AIInsightsPanel insights={analysis.result.business_insights} />
                </TechSection>
              )}

              <TechSection id="summary" icon={TrendingUp} title="Key Performance Metrics" subtitle="Statistical telemetry & executive manifest">
                <KPIGrid summary={analysis?.result?.summary} anomaly_detection={analysis?.result?.anomaly_detection} column_types={analysis?.result?.column_types} />
              </TechSection>

              <TechSection id="charts" icon={BarChart3} title="Visual Analytics" subtitle="High-resolution data distributions">
                <ChartsGrid charts_data={analysis?.result?.charts_data} />
              </TechSection>

              <TechSection id="chat" icon={MessageSquare} title="Query Interface" subtitle="Direct natural language data interaction">
                <ChatDataset datasetId={datasetId || ""} />
              </TechSection>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

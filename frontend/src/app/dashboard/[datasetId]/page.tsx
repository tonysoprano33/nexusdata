"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { EnterpriseSidebar } from "@/components/layout/EnterpriseSidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { ChartsGrid } from "@/components/dashboard/ChartsGrid";
import { ChatDataset } from "@/components/dashboard/ChatDataset";
import { AIInsightsPanel } from "../AIInsightsPanel";
import { HeroBanner } from "@/components/dashboard/HeroBanner";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { DataPreviewTabs } from "@/components/dashboard/DataPreviewTabs";
import { CleaningReport } from "@/components/dashboard/CleaningReport";
import {
  Eye, Sparkles, BarChart3, MessageSquare,
  Loader2, Wand2, ArrowLeft, ChevronRight, Activity
} from "lucide-react";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://nexusdata-api.onrender.com";

function Section({ id, icon: Icon, title, subtitle, children }: any) {
  return (
    <section id={id} className="scroll-mt-32">
      <div className="flex flex-col gap-1 mb-8">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-zinc-500" />
          <h2 className="text-sm font-bold text-white uppercase tracking-widest">{title}</h2>
        </div>
        <p className="text-xs text-zinc-600 font-medium">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

export default function DashboardPage() {
  const params = useParams();
  const datasetId = params?.datasetId as string;
  const router = useRouter();
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        console.log("[Dashboard] Fetching dataset:", datasetId);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
        
        const { data } = await axios.get(`${API_URL}/api/datasets/${datasetId}`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        
        console.log("[Dashboard] Received data:", data);
        console.log("[Dashboard] Result object:", data?.result);
        console.log("[Dashboard] Insights present:", !!data?.result?.business_insights);
        
        if (!data || !data.result) {
          console.error("[Dashboard] Invalid data structure received");
        }
        
        setAnalysis(data);
      } catch (e: any) {
        console.error("[Dashboard] Error fetching:", e);
        if (e.name === 'AbortError') {
          console.error("[Dashboard] Request timeout");
        }
        // Set empty analysis to stop loading and show error state
        setAnalysis({ id: datasetId, status: 'error', result: null });
      } finally {
        setLoading(false);
      }
    };
    if (datasetId) fetch();
  }, [datasetId]);

  if (loading) return (
    <div className="min-h-screen bg-[#030303] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-zinc-800 animate-spin" />
    </div>
  );

  const result = analysis?.result || {};
  const isCompleted = analysis?.status === "completed";

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-300 font-sans selection:bg-indigo-500/30">
      <TopNavbar sidebarCollapsed={true} datasetName={analysis?.filename} />
      
      <main className="pt-20 pb-40 max-w-[1200px] mx-auto px-6">
        {/* Minimal Breadcrumb */}
        <div className="flex items-center gap-2 mb-12 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
           <button onClick={() => router.push("/")} className="hover:text-white transition-colors">Workspace</button>
           <ChevronRight className="w-3 h-3" />
           <span className="text-zinc-400">{analysis?.filename}</span>
        </div>

        {analysis && (
          <div className="space-y-32"> {/* Aumento masivo de espacio entre secciones */}
            
            <HeroBanner
              filename={analysis.filename}
              totalRows={result.dataset_dna?.total_rows || 0}
              totalColumns={result.dataset_dna?.total_columns || 0}
              qualityBefore={result.cleaning_report?.score_before || 0}
              qualityAfter={result.cleaning_report?.score_after || 0}
              datasetId={datasetId}
              onScrollTo={(id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })}
            />

            <QuickActions />

            <Section id="insights" icon={Sparkles} title="Strategic Insights" subtitle="3 Actionable recommendations for business growth">
               <AIInsightsPanel insights={result.business_insights} totalRows={result.dataset_dna?.total_rows} />
            </Section>

            <Section id="cleaning" icon={Wand2} title="Data Integrity" subtitle="Cleanup metrics and structural fixes">
               <CleaningReport report={result.cleaning_report} />
            </Section>

            <Section id="preview" icon={Eye} title="Head Comparison" subtitle="Direct audit of first 5 rows (Original vs Cleaned)">
              <DataPreviewTabs rawPreview={result.raw_preview} cleanPreview={result.clean_preview} />
            </Section>

            <Section id="charts" icon={BarChart3} title="Visual Explorer" subtitle="Automated statistical distributions">
              <ChartsGrid charts_data={result.charts_data} isProcessing={!isCompleted} />
            </Section>

            <Section id="chat" icon={MessageSquare} title="AI Data Auditor" subtitle="Inquire about patterns or request specific transformations">
              <ChatDataset datasetId={datasetId} />
            </Section>

          </div>
        )}
      </main>
    </div>
  );
}
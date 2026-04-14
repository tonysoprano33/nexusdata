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
import { Loader2, AlertCircle, LayoutDashboard, ChevronRight } from "lucide-react";
import type { AnalysisResponse } from "@/types/analysis";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://nexusdata-api.onrender.com";

export default function DashboardPage() {
  const { datasetId } = useParams<{ datasetId: string }>();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Responsive sidebar handling
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };
    
    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!datasetId) return;

    const fetchAnalysis = async () => {
      try {
        const { data } = await axios.get(${API_URL}/api/datasets/);
        setAnalysis(data);

        if (data.status === "processing") {
          setTimeout(fetchAnalysis, 3000);
        }
      } catch (err) {
        setError("No se pudo cargar el análisis. Intentá de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [datasetId]);

  const result = analysis?.result;

  return (
    <div className="min-h-screen bg-[#060606] text-white selection:bg-blue-500/30">
      <div className="hidden lg:block">
        <EnterpriseSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      <TopNavbar
        sidebarCollapsed={sidebarCollapsed}
        datasetName={result?.summary ? "Dataset Analysis" : "Loading..."}
        datasetStatus={analysis?.status || "processing"}
        onUploadClick={() => router.push("/")}
      />

      <main
        className={cn(
          "pt-24 min-h-screen transition-all duration-300 ease-in-out",
          "lg:pl-0", // Reset on mobile
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        )}
      >
        <div className="px-4 sm:px-6 lg:px-10 py-8 max-w-[1600px] mx-auto w-full">
          
          {/* Breadcrumbs / Header */}
          {!loading && result && (
            <div className="flex items-center gap-2 mb-8 text-neutral-500">
              <div className="p-1.5 bg-neutral-900 rounded-md border border-neutral-800">
                <LayoutDashboard className="w-4 h-4" />
              </div>
              <ChevronRight className="w-4 h-4 opacity-30" />
              <span className="text-sm font-medium text-neutral-300">Datasets</span>
              <ChevronRight className="w-4 h-4 opacity-30" />
              <span className="text-sm font-bold text-white tracking-tight">
                {datasetId}
              </span>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 animate-in fade-in duration-500">
              <div className="relative flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin absolute" />
                <div className="w-12 h-12 border-4 border-blue-500/20 rounded-full"></div>
              </div>
              <div className="text-center space-y-1">
                <p className="text-white font-medium text-lg">Synthesizing intelligence...</p>
                <p className="text-neutral-500 text-sm">Processing your dataset for insights</p>
              </div>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                <AlertCircle className="w-12 h-12 text-rose-500" />
              </div>
              <div className="text-center">
                <h3 className="text-white font-semibold text-lg">Oops! Something went wrong</h3>
                <p className="text-neutral-400 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Processing */}
          {!loading && !error && analysis?.status === "processing" && (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
              <div className="relative">
                <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
                <div className="absolute inset-0 blur-2xl bg-blue-500/20 rounded-full animate-pulse"></div>
              </div>
              <div className="text-center space-y-2">
                <p className="text-2xl font-bold tracking-tight text-white">Analyzing Data</p>
                <p className="text-neutral-400 max-w-xs mx-auto">
                  Our AI is crunching the numbers and identifying patterns. This may take a moment.
                </p>
              </div>
            </div>
          )}

          {/* Completed */}
          {!loading && !error && analysis?.status === "completed" && result && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">

              {/* 1. AI Insights — lo más importante, arriba de todo */}
              {result.business_insights && (
                <section className="relative">
                  <div className="absolute -inset-x-4 -inset-y-4 bg-blue-500/5 blur-3xl rounded-full opacity-50 pointer-events-none"></div>
                  <AIInsightsPanel insights={result.business_insights} />
                </section>
              )}

              {/* 2. KPIs */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">Executive Summary</h2>
                    <p className="text-neutral-500 text-sm mt-1">Key performance indicators and dataset overview</p>
                  </div>
                </div>
                <KPIGrid
                  summary={result.summary}
                  anomaly_detection={result.anomaly_detection}
                  column_types={result.column_types}
                />
              </section>

              {/* 3. Charts */}
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight text-white">Visual Analytics</h2>
                    <p className="text-neutral-500 text-sm mt-1">Deep dive into data distributions and correlations</p>
                  </div>
                </div>
                <ChartsGrid charts_data={result.charts_data} />
              </section>

              {/* 4. Advanced Analytics */}
              {result.advanced_analytics && (
                <section className="pt-8 border-t border-neutral-800/50">
                   <div className="mb-6">
                    <h2 className="text-2xl font-bold tracking-tight text-white">Predictive Intelligence</h2>
                    <p className="text-neutral-500 text-sm mt-1">Advanced models and statistical forecasts</p>
                  </div>
                  <AdvancedAnalyticsPanel data={result.advanced_analytics} />
                </section>
              )}

              {/* 5. Chat */}
              <section className="pt-8 border-t border-neutral-800/50">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold tracking-tight text-white">Data Interaction</h2>
                  <p className="text-neutral-500 text-sm mt-1">Ask questions and get instant insights from your data</p>
                </div>
                <ChatDataset datasetId={datasetId} />
              </section>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}

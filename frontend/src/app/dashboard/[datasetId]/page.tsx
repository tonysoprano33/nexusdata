"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  Eye,
  Sparkles,
  BarChart3,
  MessageSquare,
  Loader2,
  Wand2,
  ChevronRight,
  Activity,
} from "lucide-react";

import { EnterpriseSidebar } from "@/components/layout/EnterpriseSidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { ChartsGrid } from "@/components/dashboard/ChartsGrid";
import { ChatDataset } from "@/components/dashboard/ChatDataset";
import { AIInsightsPanel } from "../AIInsightsPanel";
import { HeroBanner } from "@/components/dashboard/HeroBanner";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { DataPreviewTabs } from "@/components/dashboard/DataPreviewTabs";
import { CleaningReport } from "@/components/dashboard/CleaningReport";
import { AdvancedAnalyticsPanel } from "@/components/dashboard/AdvancedAnalyticsPanel";
import { ExecutiveOverview } from "@/components/dashboard/ExecutiveOverview";
import { BusinessRecommendations } from "@/components/dashboard/BusinessRecommendations";
import { DataQualityExplanation } from "@/components/dashboard/DataQualityExplanation";
import { AnalystNotes } from "@/components/dashboard/AnalystNotes";
import { WhyThisMatters } from "@/components/dashboard/WhyThisMatters";
import { buildApiUrl } from "@/lib/api";
import { getCachedAnalysis, upsertCachedAnalysis } from "@/lib/analysis-cache";
import { cn } from "@/lib/utils";

function Section({
  id,
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  id: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      if (loading && !analysis) {
        setLoading(false);
        setAnalysis({
          id: datasetId,
          status: "error",
          result: null,
          error: "Request timeout. Please try again.",
        });
      }
    }, 35000);

    return () => clearTimeout(safetyTimer);
  }, [loading, datasetId, analysis]);

  useEffect(() => {
    let isMounted = true;
    const cached = datasetId ? getCachedAnalysis(datasetId) : null;

    if (cached) {
      setAnalysis(cached);
      setLoading(false);
    }

    const fetchData = async () => {
      if (!datasetId) return;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 25000);
        const { data } = await axios.get(buildApiUrl(`/api/datasets/${datasetId}`), {
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (!isMounted) return;

        if (!data?.result) {
          throw new Error("Invalid data from server");
        }

        setAnalysis(data);
        upsertCachedAnalysis(data);
      } catch (error: any) {
        if (!isMounted) return;

        if (cached) {
          setAnalysis(cached);
          return;
        }

        let errorMsg = "Failed to load dataset";
        if (error.name === "AbortError") {
          errorMsg = "Request timed out. The backend may be slow.";
        } else if (error.response?.status === 404) {
          errorMsg = "Dataset not found";
        } else if (error.message) {
          errorMsg = error.message;
        }

        setAnalysis({
          id: datasetId,
          status: "error",
          result: null,
          error: errorMsg,
        });
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [datasetId]);

  const result = analysis?.result || {};
  const isCompleted = analysis?.status === "completed";
  const hasError = analysis?.status === "error";

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-300 font-sans selection:bg-indigo-500/30">
      <div className="hidden lg:block">
        <EnterpriseSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      <div className={cn("transition-all duration-300 ml-0", sidebarCollapsed ? "lg:ml-16" : "lg:ml-60")}>
        <TopNavbar
          sidebarCollapsed={sidebarCollapsed}
          datasetName={analysis?.filename}
          datasetStatus={analysis?.status}
          onUploadClick={() => router.push("/")}
        />

        <main className="pt-20 pb-40 max-w-[1200px] mx-auto px-4 sm:px-6">
          {loading && (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-10 h-10 text-zinc-700 animate-spin" />
              <p className="text-sm text-zinc-400 font-bold">Preparing your business intelligence dashboard...</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-600">
                <span className="rounded-sm border border-zinc-900 px-3 py-2">Reading dataset</span>
                <span className="rounded-sm border border-zinc-900 px-3 py-2">Scoring quality</span>
                <span className="rounded-sm border border-zinc-900 px-3 py-2">Building recommendations</span>
              </div>
            </div>
          )}

          {hasError && !loading && (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mb-2">
                <span className="text-3xl">!</span>
              </div>
              <h2 className="text-xl font-bold text-white">We could not open this analysis</h2>
              <p className="text-sm text-zinc-500 max-w-md text-center">
                {analysis?.error?.includes("parse")
                  ? "We couldn't read this file. Please check that it uses a valid delimiter and contains at least one header row."
                  : analysis?.error || "The dataset may be unavailable or the backend may still be processing it."}
              </p>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-white text-black rounded-lg text-sm font-bold hover:bg-zinc-200"
                >
                  Retry
                </button>
                <button
                  onClick={() => router.push("/datasets")}
                  className="px-4 py-2 bg-zinc-800 text-white rounded-lg text-sm font-bold hover:bg-zinc-700"
                >
                  Go to Datasets
                </button>
              </div>
            </div>
          )}

          {!loading && analysis && (
            <>
              <div className="flex items-center gap-2 mb-12 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                <button onClick={() => router.push("/")} className="hover:text-white transition-colors">
                  Workspace
                </button>
                <ChevronRight className="w-3 h-3" />
                <span className="text-zinc-400 truncate">{analysis?.filename}</span>
              </div>

              {!hasError && (
                <div className="space-y-24">
                  <HeroBanner
                    filename={analysis.filename}
                    totalRows={result.dataset_dna?.total_rows || 0}
                    totalColumns={result.dataset_dna?.total_columns || 0}
                    qualityBefore={result.cleaning_report?.score_before || 0}
                    qualityAfter={result.cleaning_report?.score_after || 0}
                    rowsRemoved={result.cleaning_report?.rows_removed || 0}
                    improvement={result.cleaning_report?.improvement || 0}
                    statistics={result.statistics}
                    onScrollTo={(id) =>
                      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
                    }
                  />

                  <ExecutiveOverview filename={analysis.filename} result={result} />

                  <Section
                    id="insights"
                    icon={Sparkles}
                    title="Strategic Insights"
                    subtitle="AI-generated analysis and business recommendations"
                  >
                    <AIInsightsPanel
                      insights={result.business_insights}
                      totalRows={result.dataset_dna?.total_rows}
                    />
                  </Section>

                  <Section
                    id="recommendations"
                    icon={Activity}
                    title="AI Business Recommendations"
                    subtitle="Decision-ready actions with confidence and risk notes"
                  >
                    <BusinessRecommendations result={result} />
                  </Section>

                  <Section
                    id="cleaning"
                    icon={Wand2}
                    title="Data Integrity Report"
                    subtitle="Quality transformation and cleanup actions"
                  >
                    <div className="space-y-6">
                      <CleaningReport report={result.cleaning_report} />
                      <DataQualityExplanation result={result} />
                    </div>
                  </Section>

                  <Section
                    id="preview"
                    icon={Eye}
                    title="Data Comparison"
                    subtitle="Explore raw vs cleaned: head, describe, info, top values"
                  >
                    <DataPreviewTabs
                      rawPreview={result.raw_preview}
                      cleanPreview={result.clean_preview}
                      diffPreview={result.diff_preview}
                      rawStats={result.statistics?.raw}
                      cleanStats={result.statistics?.clean}
                      cleaningReport={result.cleaning_report}
                    />
                  </Section>

                  <Section
                    id="charts"
                    icon={BarChart3}
                    title="Visual Explorer"
                    subtitle="Statistical distributions and correlations"
                  >
                    <ChartsGrid
                      charts_data={result.charts_data}
                      statistics={result.statistics}
                      rawPreview={result.raw_preview}
                      isProcessing={!isCompleted}
                    />
                  </Section>

                  {result.advanced_analytics && (
                    <Section
                      id="advanced"
                      icon={Activity}
                      title="Advanced Analytics"
                      subtitle="Automatic ML and segmentation signals"
                    >
                      <AdvancedAnalyticsPanel data={result.advanced_analytics} />
                    </Section>
                  )}

                  <QuickActions />

                  <Section
                    id="analyst-notes"
                    icon={Eye}
                    title="Analyst Notes"
                    subtitle="Assumptions, limitations and trust guidance"
                  >
                    <AnalystNotes result={result} />
                  </Section>

                  <WhyThisMatters />

                  <Section
                    id="chat"
                    icon={MessageSquare}
                    title="AI Data Auditor"
                    subtitle="Ask questions about your dataset"
                  >
                    <ChatDataset datasetId={datasetId} />
                  </Section>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

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
} from "lucide-react";
import type { AnalysisResponse } from "@/types/analysis";
import { cn } from "@/lib/utils";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://nexusdata-api.onrender.com";

// ─── Section wrapper ───────────────────────────────────────────────────────────
function Section({
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
    <section
      id={id}
      className={cn(
        "relative rounded-2xl border p-6 lg:p-8 transition-all duration-300",
        accent
          ? "bg-blue-950/20 border-blue-500/20 shadow-[0_0_60px_-15px_rgba(59,130,246,0.2)]"
          : "bg-neutral-900/40 border-neutral-800/60 hover:border-neutral-700/60"
      )}
    >
      {accent && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 via-transparent to-transparent pointer-events-none" />
      )}
      <div className="flex items-start gap-4 mb-6">
        <div
          className={cn(
            "p-2.5 rounded-xl border shrink-0",
            accent
              ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
              : "bg-neutral-800 border-neutral-700 text-neutral-400"
          )}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white">
            {title}
          </h2>
          <p className="text-neutral-500 text-sm mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="relative z-10">{children}</div>
    </section>
  );
}

// ─── Processing pulse animation ────────────────────────────────────────────────
function ProcessingState() {
  const steps = [
    "Reading dataset structure...",
    "Running statistical analysis...",
    "Detecting anomalies...",
    "Generating AI insights...",
    "Building visualizations...",
  ];
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(
      () => setStep((s) => (s + 1) % steps.length),
      2200
    );
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-10">
      {/* Animated rings */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 animate-ping" />
        <div className="absolute inset-2 rounded-full border-2 border-blue-500/30 animate-ping [animation-delay:300ms]" />
        <div className="absolute inset-4 rounded-full border-2 border-blue-500/40 animate-ping [animation-delay:600ms]" />
        <div className="relative p-3 bg-blue-500/10 rounded-full border border-blue-500/30">
          <Cpu className="w-7 h-7 text-blue-400" />
        </div>
      </div>

      <div className="text-center space-y-3">
        <p className="text-white font-semibold text-xl tracking-tight">
          Analyzing your dataset
        </p>
        <div className="h-5 overflow-hidden">
          <p
            key={step}
            className="text-neutral-400 text-sm animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            {steps[step]}
          </p>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5">
        {steps.map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-1.5 h-1.5 rounded-full transition-all duration-500",
              i === step ? "bg-blue-400 w-4" : "bg-neutral-700"
            )}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Error state ───────────────────────────────────────────────────────────────
function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
        <AlertCircle className="w-10 h-10 text-rose-400" />
      </div>
      <div className="text-center space-y-1">
        <h3 className="text-white font-semibold text-lg">Something went wrong</h3>
        <p className="text-neutral-400 text-sm max-w-sm">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 hover:border-neutral-600 text-white text-sm font-medium rounded-xl transition-all duration-200"
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </button>
      )}
    </div>
  );
}

// ─── Loading skeleton ──────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 bg-neutral-800 rounded-lg" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-neutral-800/60 rounded-xl" />
        ))}
      </div>
      <div className="h-72 bg-neutral-800/40 rounded-2xl" />
      <div className="h-64 bg-neutral-800/30 rounded-2xl" />
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
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
    setError(null);
    try {
      const { data } = await axios.get(
        `${API_URL}/api/datasets/${datasetId}`
      );
      setAnalysis(data);
      if (data.status === "processing") {
        setTimeout(fetchAnalysis, 3000);
      }
    } catch {
      setError("No se pudo cargar el análisis. Verificá tu conexión e intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [datasetId]);

  const result = analysis?.result;

  return (
    <div className="min-h-screen bg-[#060606] text-white selection:bg-blue-500/30">
      {/* Subtle background grid */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      {/* Sidebar */}
      {!isMobile && (
        <EnterpriseSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      )}

      {/* Top nav */}
      <TopNavbar
        sidebarCollapsed={sidebarCollapsed}
        datasetName={analysis?.filename || "Analysis Dashboard"}
        datasetStatus={analysis?.status || "processing"}
        onUploadClick={() => router.push("/")}
      />

      <main
        className={cn(
          "pt-[72px] min-h-screen transition-all duration-300 ease-in-out",
          isMobile ? "ml-0" : sidebarCollapsed ? "ml-20" : "ml-64"
        )}
      >
        <div className="px-4 sm:px-6 lg:px-10 py-8 max-w-[1600px] mx-auto w-full">

          {/* ── Breadcrumbs ───────────────────────────────────────── */}
          {!loading && !error && (
            <nav className="flex items-center gap-2 mb-8">
              <div className="p-1.5 bg-neutral-900 rounded-md border border-neutral-800 text-neutral-500">
                <LayoutDashboard className="w-3.5 h-3.5" />
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-700" />
              <button
                onClick={() => router.push("/")}
                className="text-[13px] text-neutral-500 hover:text-neutral-300 transition-colors"
              >
                Datasets
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-700" />
              <span className="text-[13px] font-semibold text-white truncate max-w-[220px]">
                {analysis?.filename || datasetId}
              </span>

              {/* Status badge */}
              {analysis?.status === "completed" && (
                <span className="ml-2 px-2 py-0.5 text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                  Completed
                </span>
              )}
              {analysis?.status === "processing" && (
                <span className="ml-2 px-2 py-0.5 text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                  Processing
                </span>
              )}
              {analysis?.status === "failed" && (
                <span className="ml-2 px-2 py-0.5 text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full">
                  Failed
                </span>
              )}
            </nav>
          )}

          {/* ── States ───────────────────────────────────────────── */}

          {loading && <LoadingSkeleton />}

          {!loading && error && (
            <ErrorState
              message={error}
              onRetry={() => {
                setLoading(true);
                fetchAnalysis();
              }}
            />
          )}

          {!loading && !error && analysis?.status === "processing" && (
            <ProcessingState />
          )}

          {!loading && !error && analysis?.status === "failed" && (
            <ErrorState
              message={analysis.error || "Internal processing error"}
              onRetry={() => router.push("/")}
            />
          )}

          {/* ── Completed ─────────────────────────────────────────── */}
          {!loading && !error && analysis?.status === "completed" && result && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

              {/* 1. AI Insights */}
              {result.business_insights && (
                <Section
                  id="insights"
                  icon={Sparkles}
                  title="AI Insights"
                  subtitle="Intelligent analysis powered by Groq — actionable findings from your data"
                  accent
                >
                  <AIInsightsPanel insights={result.business_insights} />
                </Section>
              )}

              {/* 2. KPIs */}
              <Section
                id="summary"
                icon={TrendingUp}
                title="Executive Summary"
                subtitle="Key performance indicators and dataset overview"
              >
                <KPIGrid
                  summary={result.summary}
                  anomaly_detection={result.anomaly_detection}
                  column_types={result.column_types}
                />
              </Section>

              {/* 3. Charts */}
              <Section
                id="charts"
                icon={BarChart3}
                title="Visual Analytics"
                subtitle="Deep dive into distributions, correlations and trends"
              >
                <ChartsGrid charts_data={result.charts_data} />
              </Section>

              {/* 4. Advanced Analytics */}
              {result.advanced_analytics && (
                <Section
                  id="advanced"
                  icon={Cpu}
                  title="Predictive Intelligence"
                  subtitle="Advanced models and statistical forecasts"
                >
                  <AdvancedAnalyticsPanel data={result.advanced_analytics} />
                </Section>
              )}

              {/* 5. Chat */}
              <Section
                id="chat"
                icon={MessageSquare}
                title="Data Interaction"
                subtitle="Ask questions in plain language and get instant answers from your dataset"
              >
                <ChatDataset datasetId={datasetId} />
              </Section>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}
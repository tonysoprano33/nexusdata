"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { EnterpriseSidebar } from "@/components/layout/EnterpriseSidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { KPIGrid } from "@/components/dashboard/KPIGrid";
import { ChartsGrid } from "@/components/dashboard/ChartsGrid";
import { AdvancedAnalyticsPanel } from "@/components/dashboard/AdvancedAnalyticsPanel";
import { ChatDataset } from "@/components/dashboard/ChatDataset"
import { Loader2, AlertCircle } from "lucide-react";
import type { AnalysisResponse } from "@/types/analysis";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://nexusdata-api.onrender.com";

export default function DashboardPage() {
  const { datasetId } = useParams<{ datasetId: string }>();
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!datasetId) return;

    const fetchAnalysis = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/datasets/${datasetId}`);
        setAnalysis(data);

        // Si está procesando, polling cada 3 segundos
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
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <EnterpriseSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <TopNavbar
        sidebarCollapsed={sidebarCollapsed}
        datasetName={analysis?.result?.summary ? "Dataset Analysis" : "Loading..."}
        datasetStatus={analysis?.status || "processing"}
        onUploadClick={() => router.push("/")}
      />

      <main
        className="pt-24 transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? 80 : 260 }}
      >
        <div className="p-8 max-w-[1400px] mx-auto">

          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
              <p className="text-neutral-400 text-sm">Loading analysis...</p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <AlertCircle className="w-10 h-10 text-rose-400" />
              <p className="text-neutral-400 text-sm">{error}</p>
            </div>
          )}

          {/* Processing */}
          {!loading && !error && analysis?.status === "processing" && (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
              <p className="text-white font-medium">Analyzing your dataset...</p>
              <p className="text-neutral-500 text-sm">This may take a few seconds</p>
            </div>
          )}

          {/* Failed */}
          {!loading && !error && analysis?.status === "failed" && (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <AlertCircle className="w-10 h-10 text-rose-400" />
              <p className="text-white font-medium">Analysis failed</p>
              <p className="text-neutral-500 text-sm">{analysis.error || "Unknown error"}</p>
            </div>
          )}

          {/* Completed */}
          {!loading && !error && analysis?.status === "completed" && result && (
            <div className="space-y-8">

              {/* KPIs */}
              <KPIGrid
                summary={result.summary}
                anomaly_detection={result.anomaly_detection}
                column_types={result.column_types}
              />

              {/* Charts */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">Visualizations</h2>
                <ChartsGrid charts_data={result.charts_data} />
              </section>

              {/* Advanced Analytics */}
              {result.advanced_analytics && (
                <section>
                  <AdvancedAnalyticsPanel data={result.advanced_analytics} />
                </section>
              )}

              {/* Chat */}
              <section>
                <h2 className="text-xl font-semibold text-white mb-4">Ask your data</h2>
                <ChatDataset datasetId={datasetId} />
              </section>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}
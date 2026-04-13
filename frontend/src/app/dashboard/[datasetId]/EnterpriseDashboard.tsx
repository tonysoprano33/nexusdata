"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";

// Layout Components
import { EnterpriseSidebar } from "@/components/layout/EnterpriseSidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";

// Dashboard Components
import { KPIGrid } from "@/components/dashboard/KPIGrid";
import { ChartsGrid } from "@/components/dashboard/ChartsGrid";
import { ChatDataset } from "@/components/dashboard/ChatDataset";
import { AdvancedAnalyticsPanel } from "@/components/dashboard/AdvancedAnalyticsPanel";
import { IntelligenceCard } from "@/components/enterprise/IntelligenceCard";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Hooks
import { useAnalysis } from "@/hooks/useAnalysis";

// Icons
import { Activity, Brain, MessageSquare, CheckCircle2, AlertTriangle, Loader2, BarChart3 } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function EnterpriseDashboard() {
  const params = useParams();
  const router = useRouter();
  const datasetId = params.datasetId as string;
  const { data, loading, error } = useAnalysis(datasetId);
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full animate-pulse" />
            <Loader2 className="relative w-16 h-16 text-indigo-500 animate-spin" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white tracking-tight">AI Analysis in Progress</h2>
            <p className="text-neutral-500 text-sm max-w-xs mx-auto">Gemini is processing your dataset to uncover professional insights and patterns.</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
        <Card className="bg-rose-950/20 border-rose-500/20 max-w-md shadow-2xl">
          <CardHeader>
            <CardTitle className="text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" /> Analysis Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-rose-200/70 text-sm leading-relaxed mb-6">{error}</p>
            <Button onClick={() => router.push("/")} className="w-full bg-rose-600 hover:bg-rose-500 font-medium">
              Back to Workspace
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-indigo-500/30">
      <EnterpriseSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <TopNavbar
        sidebarCollapsed={sidebarCollapsed}
        datasetName={`Dataset ${datasetId.slice(0, 8)}`}
        datasetStatus="completed"
        dataQualityScore={data.summary.data_quality_score}
        onUploadClick={() => router.push("/")}
        onExportPDF={() => window.open(`${API_BASE_URL}/api/datasets/${datasetId}/export/pdf`, '_blank')}       
        onExportPPT={() => window.open(`${API_BASE_URL}/api/datasets/${datasetId}/export/pptx`, '_blank')}      
      />

      <main
        className="pt-16 transition-all duration-300"
        style={{ marginLeft: sidebarCollapsed ? 80 : 260 }}
      >
        <div className="p-8 max-w-[1600px] mx-auto">
          {/* Dashboard Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex justify-between items-end">
            <div>
              <div className="flex items-center gap-2 text-neutral-500 text-xs mb-3 font-medium uppercase tracking-wider">
                <span className="hover:text-indigo-400 transition-colors cursor-pointer" onClick={() => router.push("/")}>Workspace</span>    
                <span>/</span>
                <span className="text-white">Analysis</span>
              </div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3 tracking-tight">
                Data Intelligence
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-2 py-1">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Verified Ready
                </Badge>
              </h1>
            </div>
            <p className="text-neutral-500 text-xs font-mono">ID: {datasetId.slice(0, 12)}...</p>
          </motion.div>

          {/* Core Metrics */}
          <KPIGrid 
            summary={data.summary} 
            anomaly_detection={data.anomaly_detection as any} 
            column_types={data.column_types} 
          />

          {/* Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
            <TabsList className="bg-white/[0.04] border border-white/[0.08] p-1 h-11">
              <TabsTrigger value="overview" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-xs px-6 h-9 transition-all">
                <Activity className="w-3.5 h-3.5 mr-2" /> Overview
              </TabsTrigger>
              <TabsTrigger value="visualizations" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-xs px-6 h-9 transition-all">
                <BarChart3 className="w-3.5 h-3.5 mr-2" /> Visualizations ({data.charts_data?.length || 0})   
              </TabsTrigger>
              <TabsTrigger value="intelligence" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-xs px-6 h-9 transition-all">
                <Brain className="w-3.5 h-3.5 mr-2" /> ML Intelligence
              </TabsTrigger>
              <TabsTrigger value="chat" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-xs px-6 h-9 transition-all">
                <MessageSquare className="w-3.5 h-3.5 mr-2" /> Ask Data AI
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-8 outline-none">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <IntelligenceCard insights={data.business_insights} confidenceScore={92} />
                </div>
                <div className="lg:col-span-1">
                  <ChatDataset datasetId={datasetId} />
                </div>
              </div>
              <AdvancedAnalyticsPanel data={data.advanced_analytics} />
            </TabsContent>

            <TabsContent value="visualizations" className="outline-none">
              <ChartsGrid charts_data={data.charts_data} />
            </TabsContent>

            <TabsContent value="intelligence" className="outline-none space-y-8">
              <AdvancedAnalyticsPanel data={data.advanced_analytics} />
              <IntelligenceCard insights={data.business_insights} confidenceScore={92} />
            </TabsContent>

            <TabsContent value="chat" className="outline-none">
              <div className="max-w-4xl mx-auto">
                <ChatDataset datasetId={datasetId} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { EnterpriseSidebar } from "@/components/layout/EnterpriseSidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { AnalysisHistory } from "@/components/landing/AnalysisHistory";
import { Database, Plus, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function DatasetsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <EnterpriseSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <TopNavbar 
        sidebarCollapsed={sidebarCollapsed} 
        datasetName="All Datasets" 
        datasetStatus="active" 
        onUploadClick={() => router.push("/")}
      />

      <main className="pt-24 transition-all duration-300" style={{ marginLeft: sidebarCollapsed ? 80 : 260 }}>
        <div className="p-8 max-w-[1400px] mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <Database className="text-blue-500 w-8 h-8" />
                Dataset Management
              </h1>
              <p className="text-neutral-500 mt-1">Manage and monitor all your analyzed data sources.</p>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <Input className="bg-white/5 border-white/10 pl-10 h-10 text-sm focus:ring-blue-500/50" placeholder="Search files..." />
              </div>
              <Button onClick={() => router.push("/")} className="bg-blue-600 hover:bg-blue-500 gap-2 h-10 px-4">
                <Plus className="w-4 h-4" /> New Dataset
              </Button>
            </div>
          </div>

          {/* Reutilizamos el componente de historial pero en un contexto de gestion completa */}
          <AnalysisHistory />
        </div>
      </main>
    </div>
  );
}

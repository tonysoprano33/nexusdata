"use client";
import { useState, useEffect } from "react";
import { EnterpriseSidebar } from "@/components/layout/EnterpriseSidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { AnalysisHistory } from "@/components/landing/AnalysisHistory";
import { Database, Plus, Search, Filter, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function DatasetsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setSidebarCollapsed(true);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-[#060606] text-white selection:bg-blue-500/30">
      <div className={cn("transition-all duration-300", isMobile ? "hidden" : "block")}>
        <EnterpriseSidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
        />
      </div>

      <TopNavbar
        sidebarCollapsed={sidebarCollapsed}
        datasetName="All Datasets"
        datasetStatus="completed"
        onUploadClick={() => router.push("/")}
      />

      <main 
        className={cn(
          "pt-24 min-h-screen transition-all duration-300 ease-in-out",
          isMobile ? "ml-0" : sidebarCollapsed ? "ml-20" : "ml-64"
        )}
      >  
        <div className="p-4 sm:p-8 lg:p-10 max-w-[1600px] mx-auto w-full">
          
          {/* Header Section */}
          <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-12">   
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center shadow-lg shadow-blue-600/5">
                  <Database className="text-blue-500 w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-white">
                    Dataset Inventory
                  </h1>
                  <p className="text-neutral-500 font-medium">Manage, monitor and explore your analyzed data sources.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
              <div className="flex items-center bg-neutral-900 p-1 rounded-xl border border-neutral-800/50">
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg bg-neutral-800 text-blue-400 shadow-sm">
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-neutral-500 hover:text-white transition-colors">
                  <List className="w-4 h-4" />
                </Button>
              </div>

              <Button 
                onClick={() => router.push("/")} 
                className="bg-white text-black hover:bg-neutral-200 font-bold h-11 px-6 rounded-xl shadow-xl shadow-white/5 active:scale-95 transition-all ml-auto sm:ml-0"
              >
                <Plus className="w-4.5 h-4.5 mr-2 stroke-[3]" /> Upload Data
              </Button>
            </div>
          </div>

          {/* List Section */}
          <div className="bg-[#0f0f0f] border border-neutral-800/60 rounded-[3rem] p-8 shadow-2xl relative group overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
             <AnalysisHistory hideHeader={true} />
          </div>
          
          {/* Quick Stats/Tips Footer */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/[0.05] hover:border-blue-500/20 transition-all group shadow-xl">
               <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                 <Filter className="w-6 h-6 text-blue-400" />
               </div>
               <h3 className="text-lg font-black text-white mb-2 tracking-tight">Advanced Discovery</h3>
               <p className="text-sm text-neutral-500 leading-relaxed font-medium">Use advanced filters to pinpoint specific temporal trends and anomaly clusters across multiple datasets.</p>
            </div>
            
            <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/[0.05] hover:border-indigo-500/20 transition-all group shadow-xl">
               <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                 <BarChart3 className="w-6 h-6 text-indigo-400" />
               </div>
               <h3 className="text-lg font-black text-white mb-2 tracking-tight">Real-time Quality</h3>
               <p className="text-sm text-neutral-500 leading-relaxed font-medium">Monitor data quality scores in real-time. We automatically score every upload for completeness and integrity.</p>
            </div>

            <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/[0.05] hover:border-emerald-500/20 transition-all group shadow-xl">
               <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                 <Sparkles className="w-6 h-6 text-emerald-400" />
               </div>
               <h3 className="text-lg font-black text-white mb-2 tracking-tight">Neural Sync</h3>
               <p className="text-sm text-neutral-500 leading-relaxed font-medium">All datasets are indexed by our neural engine, allowing for cross-dataset business intelligence queries.</p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

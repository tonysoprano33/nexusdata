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
              <div className="relative flex-1 sm:flex-initial sm:w-80 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-blue-400 transition-colors" />        
                <Input 
                  className="bg-neutral-900 border-neutral-800/50 hover:bg-neutral-800/50 pl-10 h-11 text-sm rounded-xl transition-all focus:ring-2 focus:ring-blue-500/20 border-none shadow-inner" 
                  placeholder="Search by filename or ID..." 
                />
              </div>
              
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
          <div className="bg-[#0f0f0f] border border-neutral-800/60 rounded-3xl p-1 shadow-2xl overflow-hidden relative group">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
             <div className="p-4 sm:p-6 lg:p-8 overflow-x-auto">
               <AnalysisHistory />
             </div>
          </div>
          
          {/* Quick Stats/Tips Footer */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:border-blue-500/20 transition-all group">
               <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                 <Filter className="w-5 h-5 text-blue-400" />
               </div>
               <h3 className="font-bold text-white mb-2">Smart Filtering</h3>
               <p className="text-sm text-neutral-500 leading-relaxed">Use tags and status indicators to quickly find datasets from specific departments or time periods.</p>
            </div>
            {/* Agregamos más tips... */}
          </div>

        </div>
      </main>
    </div>
  );
}

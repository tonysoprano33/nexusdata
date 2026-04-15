"use client";
import { useState, useEffect } from "react";
import { EnterpriseSidebar } from "@/components/layout/EnterpriseSidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { FileText, Download, FileType, Clock, ExternalLink, ShieldCheck, Presentation, Loader2, Search, ArrowRight, FileCheck } from "lucide-react";
import { Card, CardInsight } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://nexusdata-api.onrender.com";

export default function ReportsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setSidebarCollapsed(mobile);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    axios.get(`${API_URL}/api/datasets/?limit=20&status=completed`)
      .then(res => setReports(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDownload = async (id: string, format: string) => {
    setDownloadingId(`${id}-${format}`);
    try {
      const response = await axios({
        url: `${API_URL}/api/datasets/${id}/export/${format}`,
        method: 'GET',
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${id.slice(0,8)}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Extraction failed:", error);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white">
      {!isMobile && (
        <EnterpriseSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      )}

      <TopNavbar sidebarCollapsed={sidebarCollapsed} datasetName="Reports Center" datasetStatus="completed" />  

      <main className={cn(
        "pt-24 min-h-screen transition-all duration-500 ease-in-out",
        isMobile ? "ml-0" : sidebarCollapsed ? "ml-20" : "ml-64"
      )}>
        <div className="px-6 lg:px-12 py-10 max-w-[1400px] mx-auto w-full">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">      
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <FileText className="text-emerald-400 w-7 h-7" />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tighter text-white uppercase">Intelligence Reports</h1>
                <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mt-1">High-fidelity strategic documentation</p>
              </div>
            </div>

            <div className="relative group w-full md:w-80">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-emerald-400 transition-colors" />
               <Input
                 placeholder="Search by manifest ID..."
                 className="bg-white/[0.03] border-white/[0.05] pl-12 h-12 text-xs font-bold uppercase tracking-widest rounded-2xl focus:ring-1 focus:ring-emerald-500/30 transition-all outline-none"
               />
            </div>
          </div>

          <div className="space-y-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-40 gap-6 opacity-40">
                <Loader2 className="w-12 h-12 text-zinc-600 animate-spin" />
                <p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-500">Mapping Node Repositories...</p>     
              </div>
            ) : reports.length === 0 ? (
              <Card className="p-32 flex flex-col items-center text-center opacity-40 border-dashed">
                <FileCheck className="w-16 h-16 mb-6 text-zinc-700" />
                <h3 className="text-xl font-black text-white uppercase tracking-widest">No Intelligence Detected</h3>
                <p className="text-zinc-500 text-xs font-black uppercase tracking-[0.2em] mt-4 max-w-sm">Complete a data analysis stream to generate neural reports.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                <AnimatePresence>
                  {reports.map((report: any, i: number) => (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card className="p-8 group">
                        <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-10">       
                          <div className="flex-1 min-w-0 flex items-center gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-white/[0.05] transition-all duration-500 shadow-xl">
                              <FileType className="text-emerald-400 w-8 h-8" />
                            </div>
                            <div className="space-y-2 truncate">
                              <div className="flex items-center gap-4">
                                <h3 className="text-2xl font-black text-white tracking-tighter truncate uppercase">{report.filename}</h3>
                                <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest text-emerald-400">SYNCED</div>
                              </div>
                              <div className="flex flex-wrap items-center gap-6 text-[11px] font-black uppercase tracking-widest text-zinc-500">
                                <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-zinc-700" /> {new Date(report.created_at).toLocaleDateString()}</span>
                                <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500/50" /> Secure Protocol</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap sm:flex-nowrap items-center gap-4">
                            <Button
                              onClick={() => handleDownload(report.id, 'pdf')}
                              disabled={downloadingId === `${report.id}-pdf`}
                              variant="ghost"
                              className="flex-1 sm:flex-none text-zinc-400 hover:text-white hover:bg-white/[0.03] font-black h-14 px-8 rounded-2xl gap-3 transition-all uppercase tracking-widest text-[11px] border border-white/[0.08]"
                            >
                              {downloadingId === `${report.id}-pdf` ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5 text-emerald-500" />}
                              Extract PDF
                            </Button>

                            <Button
                              onClick={() => handleDownload(report.id, 'pptx')}
                              disabled={downloadingId === `${report.id}-pptx`}
                              className="flex-1 sm:flex-none bg-white text-black hover:bg-zinc-200 font-black h-14 px-8 rounded-2xl gap-3 transition-all uppercase tracking-widest text-[11px] shadow-2xl shadow-white/5"
                            >
                              {downloadingId === `${report.id}-pptx` ? <Loader2 className="w-5 h-5 animate-spin" /> : <Presentation className="w-5 h-5" />}
                              Presentation
                            </Button>
                          </div>
                        </div>
                        <CardInsight label="Intelligence Node" className="mt-8">
                           Distributed Manifest Verified • CRC32: {report.id.slice(0,8).toUpperCase()}
                        </CardInsight>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { EnterpriseSidebar } from "@/components/layout/EnterpriseSidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { FileText, Download, FileType, Clock, ExternalLink, ShieldCheck, Presentation, Loader2, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setSidebarCollapsed(true);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    axios.get(`${API_URL}/api/datasets/?limit=20&status=completed`)
      .then(res => setReports(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));

    return () => window.removeEventListener("resize", checkMobile);
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
      console.error("Download failed:", error);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#060606] text-white selection:bg-emerald-500/30">
      <div className={cn("transition-all duration-300", isMobile ? "hidden" : "block")}>
        <EnterpriseSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      </div>

      <TopNavbar sidebarCollapsed={sidebarCollapsed} datasetName="Reports Center" datasetStatus="completed" />  


      <main
        className={cn(
          "pt-24 min-h-screen transition-all duration-300 ease-in-out",
          isMobile ? "ml-0" : sidebarCollapsed ? "ml-20" : "ml-64"
        )}
      >
        <div className="p-4 sm:p-8 lg:p-10 max-w-[1200px] mx-auto w-full">

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">      
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600/10 border border-emerald-600/20 flex items-center justify-center shadow-lg shadow-emerald-600/5">
                  <FileText className="text-emerald-500 w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-4xl font-black tracking-tight text-white">
                    Intelligence Reports
                  </h1>
                  <p className="text-neutral-500 font-medium">Export and share professional data insights in PDF and PowerPoint.</p>
                </div>
              </div>
            </div>

            <div className="relative group w-full md:w-72">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 group-focus-within:text-emerald-400 transition-colors" />
               <Input
                 placeholder="Search by filename..."
                 className="bg-neutral-900 border-neutral-800/50 pl-10 h-11 text-sm rounded-xl focus:ring-2 focus:ring-emerald-500/20 border-none transition-all"
               />
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-32 gap-4">
                <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                <p className="text-neutral-500 font-medium animate-pulse">Loading available analyses...</p>     
              </div>
            ) : reports.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#0f0f0f] border border-neutral-800/60 border-dashed rounded-[2.5rem] p-24 text-center group"
              >
                <div className="w-20 h-20 rounded-3xl bg-neutral-900 border border-neutral-800/50 flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500">
                  <FileText className="w-10 h-10 text-neutral-700" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No completed analysis found</h3>
                <p className="text-neutral-500 max-w-sm mx-auto font-medium">Analyze a dataset first to unlock high-fidelity intelligence reports.</p>
                <Button className="mt-8 bg-white text-black hover:bg-neutral-200 font-bold h-11 px-8 rounded-xl shadow-xl active:scale-95 transition-all">
                  Go to Dashboard
                </Button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                <AnimatePresence>
                  {reports.map((report: any, i: number) => (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Card className="bg-[#0f0f0f] border-neutral-800/60 hover:border-emerald-500/30 transition-all duration-300 rounded-[2rem] overflow-hidden group shadow-xl">
                        <CardContent className="p-8">
                          <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-8">       
                            {/* File Info */}
                            <div className="flex-1 min-w-0 flex items-center gap-5">
                              <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800/50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:bg-neutral-800 transition-all duration-500">
                                <FileType className="text-emerald-400 w-7 h-7" />
                              </div>
                              <div className="space-y-1.5 truncate">
                                <div className="flex items-center gap-3">
                                  <h3 className="text-xl font-bold text-white tracking-tight truncate leading-none">{report.filename}</h3>
                                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-black uppercase tracking-widest px-2 py-0.5">READY</Badge>
                                </div>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-neutral-500 font-medium">
                                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 opacity-70" /> {new Date(report.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                  <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 opacity-70" /> High Integrity</span>
                                  <span className="bg-white/5 px-2 py-0.5 rounded-lg text-[10px] font-mono tracking-tighter border border-white/5">ID: {report.id.slice(0,12)}</span>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap sm:flex-nowrap items-center gap-4">
                              <Button
                                onClick={() => handleDownload(report.id, 'pdf')}
                                disabled={downloadingId === `${report.id}-pdf`}
                                variant="outline"
                                className="flex-1 sm:flex-none border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800 text-neutral-300 hover:text-white font-bold h-12 px-6 rounded-2xl gap-2.5 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                              >
                                {downloadingId === `${report.id}-pdf` ? (
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                  <FileText className="w-5 h-5 text-emerald-500" />
                                )}
                                PDF Report
                              </Button>

                              <Button
                                onClick={() => handleDownload(report.id, 'pptx')}
                                disabled={downloadingId === `${report.id}-pptx`}
                                className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-12 px-6 rounded-2xl gap-2.5 transition-all shadow-xl shadow-emerald-600/10 active:scale-95 disabled:opacity-50"
                              >
                                {downloadingId === `${report.id}-pptx` ? (
                                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                                ) : (
                                  <Presentation className="w-5 h-5 text-white" />
                                )}
                                PowerPoint
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Pro Tip Section */}
          <div className="mt-16 p-8 rounded-[2rem] bg-emerald-600/5 border border-emerald-600/10 flex flex-col md:flex-row items-center gap-8 group">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0 group-hover:rotate-12 transition-transform duration-500">
               <ShieldCheck className="w-8 h-8 text-emerald-400" />
            </div>
            <div className="space-y-1 text-center md:text-left">
              <h4 className="text-lg font-bold text-white">Security & Integrity</h4>
              <p className="text-neutral-400 font-medium">All generated reports are digitally signed and cryptographically verified to ensure data origin and integrity across your organization.</p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

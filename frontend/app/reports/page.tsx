"use client";
import { useState, useEffect } from "react";
import { EnterpriseSidebar } from "@/components/layout/EnterpriseSidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { FileText, Download, FileType, Clock, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import axios from "axios";

export default function ReportsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("https://nexusdata-api.onrender.com/api/datasets/?limit=20&status=completed")
      .then(res => setReports(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <EnterpriseSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <TopNavbar sidebarCollapsed={sidebarCollapsed} datasetName="Reports Center" datasetStatus="active" />

      <main className="pt-24 transition-all duration-300" style={{ marginLeft: sidebarCollapsed ? 80 : 260 }}>
        <div className="p-8 max-w-[1200px] mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <FileText className="text-emerald-500 w-8 h-8" />
              Intelligence Reports
            </h1>
            <p className="text-neutral-500 mt-1">Export your AI-driven insights into professional presentation formats.</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              <div className="text-neutral-500 text-center py-20">Loading available reports...</div>
            ) : reports.length === 0 ? (
              <Card className="bg-neutral-900/30 border-white/5 border-dashed p-20 text-center">
                <FileText className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
                <p className="text-neutral-500">No completed analysis found to generate reports.</p>
              </Card>
            ) : (
              reports.map((report: any) => (
                <Card key={report.id} className="bg-neutral-900/40 border-white/5 hover:border-white/10 transition-all overflow-hidden group">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row items-stretch md:items-center p-6 gap-6">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <FileType className="text-blue-400 w-5 h-5" />
                          <h3 className="text-lg font-semibold text-white truncate">{report.filename}</h3>
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">READY</Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-neutral-500">
                          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(report.created_at).toLocaleDateString()}</span>
                          <span className="bg-white/5 px-2 py-0.5 rounded text-[10px]">ID: {report.id.slice(0,8)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Button 
                          onClick={() => window.open(`https://nexusdata-api.onrender.com/api/datasets/${report.id}/export/pdf`, '_blank')}
                          variant="outline" className="border-white/10 hover:bg-white/5 text-xs h-10 px-4 gap-2"
                        >
                          <Download className="w-4 h-4" /> PDF Report
                        </Button>
                        <Button 
                          onClick={() => window.open(`https://nexusdata-api.onrender.com/api/datasets/${report.id}/export/pptx`, '_blank')}
                          className="bg-indigo-600 hover:bg-indigo-500 text-xs h-10 px-4 gap-2"
                        >
                          <Download className="w-4 h-4" /> PowerPoint
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, ChevronRight, FileSpreadsheet, Loader2, Sparkles, X, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { cn } from "@/lib/utils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://nexusdata-api.onrender.com";

export function UploadSection() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await axios.post(`${API_URL}/api/datasets/upload`, formData, {   
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data?.id) {
        router.push("/dashboard/" + data.id);
      }
    } catch (error) {
      console.error(error);
      setUploading(false);
      alert("Analysis engine reported an error. Please check file format.");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="bg-transparent border-none shadow-none overflow-visible">
        <CardContent className="p-0 space-y-8">
          <div className="text-center space-y-3 mb-10">
             <h2 className="text-3xl font-black tracking-tight text-white">Ingest Dataset</h2>
             <p className="text-neutral-500 font-medium">Upload your CSV, Excel or JSON files for neural processing.</p>
          </div>

          <label className={cn(
            "group relative flex flex-col items-center justify-center p-12 sm:p-20 cursor-pointer rounded-[2.5rem] transition-all duration-500",
            "border-2 border-dashed border-neutral-800 hover:border-blue-500/40 bg-neutral-900/20 hover:bg-neutral-900/40",
            file && "border-blue-500/30 bg-blue-500/[0.02]"
          )}>
            <input 
              type="file" 
              accept=".csv,.xlsx,.xls,.json" 
              onChange={(e) => e.target.files && setFile(e.target.files[0])} 
              className="hidden" 
              disabled={uploading}
            />
            
            <AnimatePresence mode="wait">
              {file ? (
                <motion.div 
                  key="file-active"
                  initial={{ scale: 0.9, opacity: 0 }} 
                  animate={{ scale: 1, opacity: 1 }} 
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="flex flex-col items-center gap-6"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full" />
                    <div className="relative h-20 w-20 rounded-3xl bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-500/40">      
                      <FileSpreadsheet className="text-white h-10 w-10" />
                    </div>
                    <button 
                      onClick={(e) => { e.preventDefault(); setFile(null); }}
                      className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-neutral-800 border border-neutral-700 text-white flex items-center justify-center hover:bg-rose-500 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-center space-y-1">
                    <span className="text-xl font-black text-white block truncate max-w-xs">{file.name}</span>
                    <span className="text-sm text-neutral-500 font-bold uppercase tracking-widest">{(file.size / 1024 / 1024).toFixed(2)} MB</span>     
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="upload-idle"
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-6 text-center"
                >
                  <div className="h-20 w-20 rounded-[2rem] bg-neutral-900 border border-neutral-800 flex items-center justify-center group-hover:scale-110 group-hover:border-neutral-700 transition-all duration-500">
                    <Upload className="h-10 w-10 text-neutral-500 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <span className="text-xl font-bold text-neutral-300 block">Select or drop file</span>
                    <div className="flex items-center gap-3 text-[11px] font-black text-neutral-600 uppercase tracking-widest">
                       <span>CSV</span>
                       <div className="w-1 h-1 rounded-full bg-neutral-800" />
                       <span>Excel</span>
                       <div className="w-1 h-1 rounded-full bg-neutral-800" />
                       <span>JSON</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </label>

          {file && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-4"
            >
              {uploading ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                      <span className="text-sm font-bold text-white tracking-tight uppercase tracking-widest">Neural Analysis in Progress</span>
                    </div>
                    <span className="text-[11px] font-black text-blue-400">EST. 8 SEC</span>
                  </div>
                  <div className="h-3 bg-neutral-900 rounded-full overflow-hidden border border-white/[0.03] p-0.5">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 10, ease: "linear" }}
                    />
                  </div>
                  <p className="text-xs text-neutral-500 font-medium text-center italic">Gemini Ultra 2.0 is identifying statistical correlations and market risks...</p>
                </div>
              ) : (
                <Button
                  onClick={handleUpload}
                  className="w-full bg-white text-black hover:bg-neutral-200 rounded-[1.25rem] h-16 text-lg font-black transition-all shadow-2xl shadow-white/5 active:scale-[0.98] group"
                >
                  Initialize Synthesis
                  <Sparkles className="ml-3 h-5 w-5 text-blue-600 group-hover:scale-125 transition-transform" />
                </Button>
              )}
            </motion.div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-10 border-t border-white/[0.04]">
             <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                   <Database className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1">
                   <p className="text-[11px] font-black text-neutral-500 uppercase tracking-wider">Enterprise Security</p>
                   <p className="text-[13px] text-neutral-300 font-medium">SOC2 Compliant processing.</p>
                </div>
             </div>
             <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                   <Sparkles className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1">
                   <p className="text-[11px] font-black text-neutral-500 uppercase tracking-wider">AI Inference</p>
                   <p className="text-[13px] text-neutral-300 font-medium">Powered by Gemini Ultra 2.0.</p>
                </div>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

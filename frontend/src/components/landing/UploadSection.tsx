"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileSpreadsheet, Loader2, X, ShieldCheck, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { cn } from "@/lib/utils";
import { buildApiUrl } from "@/lib/api";
import { upsertCachedAnalysis } from "@/lib/analysis-cache";
import { DemoDatasetButton } from "@/components/landing/DemoDatasetButton";

const ACCEPTED_EXTENSIONS = [".csv", ".xlsx", ".xls", ".json"];
const MAX_FILE_SIZE_MB = 100;

export function UploadSection() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const selectFile = (selectedFile: File | null) => {
    setError("");
    if (!selectedFile) {
      setFile(null);
      return;
    }

    const extension = selectedFile.name.slice(selectedFile.name.lastIndexOf(".")).toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      setFile(null);
      setError("We could not read this file type. Upload a CSV, Excel or JSON file.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setFile(null);
      setError(`This file is too large. Please keep uploads under ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await axios.post(buildApiUrl("/api/datasets/upload"), formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data?.id) {
        upsertCachedAnalysis(data);
        router.push("/dashboard/" + data.id);
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploading(false);
      setError(
        "We couldn't read this dataset. Check that the file has a valid header row, a consistent delimiter, and at least one data row."
      );
    }
  };

  return (
    <div className="w-full">
      <div className="space-y-8">
        <label className={cn(
          "group relative flex flex-col items-center justify-center p-12 cursor-pointer rounded-sm transition-all duration-300",
          "border border-zinc-900 bg-zinc-950/20 hover:border-zinc-700",
          file && "border-white/10 bg-zinc-900"
        )}>
          <input type="file" accept=".csv,.xlsx,.xls,.json" onChange={(e) => selectFile(e.target.files?.[0] ?? null)} className="hidden" disabled={uploading} />

          <AnimatePresence mode="wait">
            {file ? (
              <motion.div key="file-active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="h-12 w-12 rounded-sm bg-white flex items-center justify-center"><FileSpreadsheet className="text-black h-6 w-6" /></div>
                  <button onClick={(e) => { e.preventDefault(); selectFile(null); }} className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-black border border-zinc-800 text-zinc-600 hover:text-white flex items-center justify-center transition-colors"><X className="h-3 w-3" /></button>
                </div>
                <div className="text-center space-y-1">
                  <span className="text-sm font-black text-white block uppercase tracking-tighter truncate max-w-[150px]">{file.name}</span>  
                  <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </motion.div>
            ) : (
              <motion.div key="upload-idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4 text-center">
                <div className="h-12 w-12 rounded-sm border border-zinc-900 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all duration-500"><Upload className="h-5 w-5" /></div>
                <div className="space-y-2">
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Initialize Ingestion</span>       
                  <p className="text-[9px] font-bold text-zinc-800 uppercase tracking-widest">CSV / XLSX / JSON</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </label>

        {file && (
          <div className="space-y-4">
            {uploading ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Loader2 className="w-3 h-3 text-white animate-spin" /><span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">AI analysis in progress</span></div></div>
                <div className="h-0.5 bg-zinc-900 overflow-hidden"><motion.div className="h-full bg-white" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 8, ease: "linear" }} /></div>
              </div>
            ) : (
              <Button onClick={handleUpload} className="w-full bg-white text-black hover:bg-zinc-200 rounded-sm h-12 text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-[0.98]">Execute Synthesis</Button>
            )}
          </div>
        )}

        {error && (
          <div className="rounded-sm border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-200 leading-relaxed">
            {error}
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <div className="rounded-sm border border-zinc-900 bg-black/30 p-4">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600">
              No file ready?
            </p>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
              Open a prepared customer revenue dataset with cleaning issues, churn signals and business recommendations.
            </p>
          </div>
          <DemoDatasetButton compact label="Run portfolio demo" />
        </div>

        <div className="grid grid-cols-2 gap-8 pt-8 border-t border-zinc-900/50">
           <div className="space-y-2">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-700" />
              <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest leading-none">Security Manifest</p>
              <p className="text-[10px] text-zinc-500 font-medium">Local-first processing flow</p>
           </div>
           <div className="space-y-2">
              <Cpu className="w-3.5 h-3.5 text-zinc-700" />
              <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest leading-none">Inference Engine</p>
              <p className="text-[10px] text-zinc-500 font-medium">Gemini, Groq or rule-based fallback</p>
           </div>
        </div>
      </div>
    </div>
  );
}

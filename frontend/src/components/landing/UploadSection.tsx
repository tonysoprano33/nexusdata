"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileSpreadsheet, Loader2, X, ShieldCheck, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      if (data?.id) router.push("/dashboard/" + data.id);
    } catch (error) {
      console.error(error);
      setUploading(false);
      alert("Inference protocol failed. Verify GROQ endpoint connectivity.");
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
          <input type="file" accept=".csv,.xlsx,.xls,.json" onChange={(e) => e.target.files && setFile(e.target.files[0])} className="hidden" disabled={uploading} />

          <AnimatePresence mode="wait">
            {file ? (
              <motion.div key="file-active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="h-12 w-12 rounded-sm bg-white flex items-center justify-center"><FileSpreadsheet className="text-black h-6 w-6" /></div>
                  <button onClick={(e) => { e.preventDefault(); setFile(null); }} className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-black border border-zinc-800 text-zinc-600 hover:text-white flex items-center justify-center transition-colors"><X className="h-3 w-3" /></button>
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
                <div className="flex items-center justify-between"><div className="flex items-center gap-2"><Loader2 className="w-3 h-3 text-white animate-spin" /><span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">GROQ LPU Inference in Progress</span></div></div>
                <div className="h-0.5 bg-zinc-900 overflow-hidden"><motion.div className="h-full bg-white" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 8, ease: "linear" }} /></div>
              </div>
            ) : (
              <Button onClick={handleUpload} className="w-full bg-white text-black hover:bg-zinc-200 rounded-sm h-12 text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-[0.98]">Execute Synthesis</Button>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-8 pt-8 border-t border-zinc-900/50">
           <div className="space-y-2">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-700" />
              <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest leading-none">Security Manifest</p>
              <p className="text-[10px] text-zinc-500 font-medium">SOC2 Compliant Protocol</p>
           </div>
           <div className="space-y-2">
              <Cpu className="w-3.5 h-3.5 text-zinc-700" />
              <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest leading-none">Inference Engine</p>
              <p className="text-[10px] text-zinc-500 font-medium">GROQ LPU™ Architecture</p>
           </div>
        </div>
      </div>
    </div>
  );
}
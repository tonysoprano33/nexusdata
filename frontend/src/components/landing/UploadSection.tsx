"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, ChevronRight, BarChart2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import axios from "axios";

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
      const { data } = await axios.post("https://nexusdata-api.onrender.com/api/datasets/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data?.id) {
        if (data.result) {
          window.localStorage.setItem("analysis:" + data.id, JSON.stringify(data.result));
        }
        router.push("/dashboard/" + data.id);
      }
    } catch (error) {
      console.error(error);
      setUploading(false);
      alert("Error en la subida. Revisa la consola.");
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto relative z-10 -mt-10 mb-20">
      <Card className="bg-neutral-900/50 border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl">
        <CardContent className="p-0">
          <label className="flex flex-col items-center justify-center p-12 cursor-pointer border-2 border-dashed border-neutral-800 hover:border-indigo-500/50 transition-all">
            <input type="file" accept=".csv,.xlsx,.xls,.json" onChange={(e) => e.target.files && setFile(e.target.files[0])} className="hidden" />
            {file ? (
              <div className="flex flex-col items-center gap-3">
                <BarChart2 className="text-indigo-400" />
                <span className="text-white">{file.name}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Upload className="text-neutral-500" />
                <span className="text-neutral-300">Sube tu archivo</span>
              </div>
            )}
          </label>
          {file && (
            <div className="p-4 bg-black/20 border-t border-white/5">
              {uploading ? (
                <div className="text-center text-indigo-400 text-sm">Analizando con IA...</div>
              ) : (
                <Button onClick={handleUpload} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white">Generar Análisis</Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

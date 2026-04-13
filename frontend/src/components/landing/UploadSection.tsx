"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, ChevronRight, BarChart2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export function UploadSection() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const router = useRouter();

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/datasets/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (typeof window !== "undefined" && data?.id) {
        if (data.result) {
          window.localStorage.setItem(`analysis:${data.id}`, JSON.stringify(data.result));
        }
        router.push(`/dashboard/${data.id}`);
      }
    } catch (error) {
      console.error(error);
      setUploading(false);
      alert("Error uploading file. Check console for details.");
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto relative z-10 -mt-10 mb-20">
      <Card className="bg-neutral-900/50 border-white/10 backdrop-blur-xl overflow-hidden shadow-2xl">
        <CardContent className="p-0">
          <label
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center p-12 cursor-pointer border-2 border-dashed transition-all duration-300 ${
              file ? "border-indigo-500/50 bg-indigo-500/5" : "border-neutral-800 hover:border-neutral-700 hover:bg-white/5"
            }`}
          >
            <input
              type="file"
              accept=".csv,.xlsx,.xls,.json"
              onChange={(e) => e.target.files && setFile(e.target.files[0])}
              className="hidden"
            />
            {file ? (
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex flex-col items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-indigo-500/20 flex items-center justify-center">      
                  <BarChart2 className="text-indigo-400" />
                </div>
                <span className="text-lg font-medium text-white">{file.name}</span>
                <span className="text-sm text-neutral-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>     
              </motion.div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-center">
                <Upload className="h-10 w-10 text-neutral-500 mb-2" />
                <span className="text-lg text-neutral-300">Drop your dataset</span>
                <span className="text-sm text-neutral-600">Supports CSV, Excel or JSON</span>
              </div>
            )}
          </label>
          {file && (
            <div className="p-4 border-t border-white/5 bg-black/20">
              {uploading ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-indigo-400">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm font-medium">Analyzing with AI...</span>
                  </div>
                  <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 8, ease: "easeInOut" }}
                    />
                  </div>
                  <p className="text-xs text-neutral-500 text-center">Generating professional insights in seconds</p>
                </div>
              ) : (
                <Button
                  onClick={handleUpload}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl h-12 text-lg font-medium transition-all"
                >
                  Generate AI Analysis
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

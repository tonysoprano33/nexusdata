"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, FileSpreadsheet, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";

export function AnalysisHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    axios.get("https://nexusdata-api.onrender.com/api/datasets/?limit=12")
      .then(res => setHistory(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="max-w-6xl mx-auto px-6 pb-24">
      <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
        <Clock className="text-indigo-400" /> Historial de Análisis
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {history.map((item) => (
          <Card key={item.id} className="bg-neutral-900/40 border-white/10 cursor-pointer hover:border-indigo-500/50 transition-all" onClick={() => router.push("/dashboard/" + item.id)}>
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="text-neutral-500" />
                <span className="text-white text-sm font-medium truncate">{item.filename}</span>
              </div>
              <div className="mt-3 text-xs text-neutral-500 capitalize">{item.status}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

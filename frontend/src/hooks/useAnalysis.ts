"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import type { AnalysisResponse } from "@/types/analysis";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export function useAnalysis(datasetId: string) {
  const [data, setData] = useState<AnalysisResponse["result"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storageKey = `analysis:${datasetId}`;

    if (typeof window !== "undefined") {
      const cached = window.localStorage.getItem(storageKey);
      if (cached) {
        try {
          setData(JSON.parse(cached));
          setLoading(false);
        } catch (e) { console.error(e); }
      }
    }

    const fetchData = async () => {
      try {
        const response = await axios.get<AnalysisResponse>(`${API_BASE_URL}/api/datasets/${datasetId}`);
        const payload = response.data;

        if (payload.status === "completed") {
          setData(payload.result ?? null);
          if (typeof window !== "undefined" && payload.result) {
            window.localStorage.setItem(storageKey, JSON.stringify(payload.result));
          }
          setLoading(false);
          return true; // Finished
        } else if (payload.status === "failed") {
          setError(payload.error ?? "Analysis failed");
          setLoading(false);
          return true; // Finished
        }
        return false; // Still processing
      } catch (err) {
        console.error(err);
        return false;
      }
    };

    const interval = setInterval(async () => {
      const finished = await fetchData();
      if (finished) clearInterval(interval);
    }, 3000);

    fetchData();
    return () => clearInterval(interval);
  }, [datasetId]);

  return { data, loading, error };
}

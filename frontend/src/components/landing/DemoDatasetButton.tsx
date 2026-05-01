"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Loader2, Play, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { buildApiUrl } from "@/lib/api";
import { upsertCachedAnalysis } from "@/lib/analysis-cache";
import { cn } from "@/lib/utils";

type DemoDatasetButtonProps = {
  className?: string;
  label?: string;
  compact?: boolean;
};

export function DemoDatasetButton({
  className,
  label = "Try sample dataset",
  compact = false,
}: DemoDatasetButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const runDemo = async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await axios.post(buildApiUrl("/api/datasets/demo?provider=auto"));
      if (!data?.id) {
        throw new Error("Demo analysis did not return an id");
      }
      upsertCachedAnalysis(data);
      router.push(`/dashboard/${data.id}`);
    } catch (err) {
      console.error("Demo dataset error:", err);
      setLoading(false);
      setError("The hosted demo dataset could not be analyzed. Try uploading a CSV instead.");
    }
  };

  return (
    <div className={cn("space-y-2", compact && "w-full")}>
      <Button
        onClick={runDemo}
        disabled={loading}
        className={cn(
          "rounded-sm border border-white/10 bg-zinc-900 text-white hover:bg-white hover:text-black",
          "h-11 px-5 text-[10px] font-black uppercase tracking-[0.2em]",
          compact && "w-full",
          className
        )}
      >
        {loading ? (
          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
        ) : (
          <Play className="mr-2 h-3.5 w-3.5 fill-current" />
        )}
        {loading ? "Generating demo" : label}
        {!loading && <Sparkles className="ml-2 h-3.5 w-3.5" />}
      </Button>

      {error && (
        <p className="text-xs leading-relaxed text-rose-200">
          {error}
        </p>
      )}
    </div>
  );
}

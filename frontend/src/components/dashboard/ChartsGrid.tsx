"use client";

import { Activity } from "lucide-react";

import ChartRenderer from "@/components/ChartRenderer";
import type { ChartData } from "@/types/analysis";

interface ChartsGridProps {
  charts_data?: ChartData[];
  statistics?: any;
  rawPreview?: any[];
  isProcessing?: boolean;
}

export function ChartsGrid({ charts_data, statistics, rawPreview, isProcessing }: ChartsGridProps) {
  if (isProcessing) {
    return (
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {[1, 2].map((item) => (
          <div key={item} className="bg-black/40 border border-zinc-900 rounded-2xl p-10 space-y-10 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-sm bg-zinc-900" />
              <div className="space-y-2">
                <div className="w-40 h-4 bg-zinc-800 rounded-sm" />
                <div className="w-20 h-2 bg-zinc-900 rounded-sm" />
              </div>
            </div>
            <div className="w-full h-[250px] bg-zinc-900/50 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  const displayCharts =
    charts_data && charts_data.length > 0
      ? charts_data
      : generateFallbackCharts(statistics, rawPreview || []);

  if (!displayCharts || displayCharts.length === 0) {
    return (
      <div className="py-32 text-center border border-dashed border-zinc-900 rounded-sm">
        <Activity className="w-8 h-8 text-zinc-800 mx-auto mb-4" />
        <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">
          No Visual Data Available
        </h3>
        <p className="text-xs text-zinc-700 mt-2">
          Upload a dataset with numeric or categorical columns to see charts.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {displayCharts.map((chart, index) => (
        <ChartRenderer key={`${chart.title}-${index}`} chartData={chart} index={index} />
      ))}
    </div>
  );
}

function generateFallbackCharts(statistics: any, rawPreview: any[]): ChartData[] {
  if (!statistics || rawPreview.length === 0) return [];

  const charts: ChartData[] = [];
  const sampleRow = rawPreview[0] ?? {};
  const columns = Object.keys(sampleRow);
  const missingColumns = statistics?.raw?.missing_values?.columns ?? {};
  const missingNames = columns.filter((column) => (missingColumns[column]?.count ?? 0) > 0);

  if (missingNames.length > 0) {
    charts.push({
      type: "bar",
      title: "Missing Values by Column",
      insight: "Highlights where data quality required the most intervention.",
      x: missingNames,
      y: missingNames.map((column) => missingColumns[column]?.count ?? 0),
      x_label: "Column",
      y_label: "Missing values",
    });
  }

  const numericSummary = statistics?.clean?.numeric_summary ?? {};
  const numericColumns = Object.keys(numericSummary).slice(0, 3);
  if (numericColumns.length > 0) {
    charts.push({
      type: "bar",
      title: "Average by Numeric Column",
      insight: "Quick comparison of the main numeric measures after cleaning.",
      x: numericColumns,
      y: numericColumns.map((column) => numericSummary[column]?.mean ?? 0),
      x_label: "Column",
      y_label: "Average",
    });
  }

  const typeCounts: Record<string, number> = {};
  for (const value of Object.values(sampleRow)) {
    const type = typeof value;
    typeCounts[type] = (typeCounts[type] || 0) + 1;
  }
  if (Object.keys(typeCounts).length > 0) {
    charts.push({
      type: "pie",
      title: "Detected Value Types",
      insight: "Rough signal of how heterogeneous the preview schema is.",
      labels: Object.keys(typeCounts),
      values: Object.values(typeCounts),
    });
  }

  return charts;
}

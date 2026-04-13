"use client";
import { KpiCard } from "@/components/enterprise/KpiCard";
import { Database, CheckCircle2, FileWarning, BarChart3 } from "lucide-react";
import type { AnalysisResponse } from "@/types/analysis";

interface KPIGridProps {
  summary: NonNullable<AnalysisResponse["result"]>["summary"];
  anomaly_detection: NonNullable<AnalysisResponse["result"]>["anomaly_detection"];
  column_types: Record<string, string>;
}

export function KPIGrid({ summary, anomaly_detection, column_types }: KPIGridProps) {
  const numericCount = Object.values(column_types).filter(t => t === 'numeric').length;
  const categoricalCount = Object.values(column_types).filter(t => t !== 'numeric').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <KpiCard
        title="Total Records"
        value={summary.total_rows.toLocaleString()}
        subtitle={`${summary.total_columns} columns analyzed`}
        icon={Database}
        color="blue"
        delay={0}
      />
      <KpiCard
        title="Data Quality"
        value={`${summary.data_quality_score ?? 0}%`}
        subtitle={summary.data_quality_score && summary.data_quality_score >= 90 ? "Excellent" : "Needs attention"}
        icon={CheckCircle2}
        color={summary.data_quality_score && summary.data_quality_score >= 85 ? "emerald" : "amber"}
        delay={0.1}
      />
      <KpiCard
        title="Anomalies"
        value={anomaly_detection?.detected_rows ?? 0}
        subtitle={`${((anomaly_detection?.ratio ?? 0) * 100).toFixed(2)}% of dataset`}
        icon={FileWarning}
        color={(anomaly_detection?.detected_rows || 0) > 0 ? "amber" : "emerald"}
        delay={0.2}
      />
      <KpiCard
        title="Fields"
        value={numericCount}
        subtitle={`${categoricalCount} categorical`}
        icon={BarChart3}
        color="violet"
        delay={0.3}
      />
    </div>
  );
}

"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, 
  Users, 
  TrendingUp, 
  BrainCircuit,
  Target,
  Sparkles,
  BarChart3
} from "lucide-react";

interface AdvancedAnalyticsProps {
  data: {
    churn_analysis?: {
      detected: boolean;
      churn_rate?: number;
      insights: string[];
    };
    rfm_segmentation?: {
      applicable: boolean;
      segments?: Array<{
        name: string;
        count: number;
        percentage: number;
      }>;
      insights: string[];
    };
    predictions?: {
      applicable: boolean;
      r2_score?: number;
      target_column?: string;
      insights: string[];
    };
    clustering?: {
      applicable: boolean;
      clusters?: Array<{
        id: number;
        name: string;
        count: number;
        percentage: number;
      }>;
      insights: string[];
    };
  };
}

export default function AdvancedAnalytics({ data }: AdvancedAnalyticsProps) {
  if (!data) return null;

  const { churn_analysis, rfm_segmentation, predictions, clustering } = data;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <BrainCircuit className="h-5 w-5 text-indigo-400" />
        <h3 className="text-lg font-semibold text-white">Análisis Avanzado Automático</h3>
        <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-xs">
          <Sparkles className="h-3 w-3 mr-1" />
          IA
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Churn Analysis */}
        {churn_analysis?.detected && (
          <Card className="bg-rose-950/20 border-rose-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-rose-300">
                <AlertTriangle className="h-4 w-4" />
                Detección de Churn
              </CardTitle>
            </CardHeader>
            <CardContent>
              {churn_analysis.churn_rate !== undefined && (
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-rose-200">Tasa de cancelación</span>
                    <span className="font-bold text-rose-300">{churn_analysis.churn_rate}%</span>
                  </div>
                  <Progress value={churn_analysis.churn_rate} className="h-2 bg-rose-950" />
                </div>
              )}
              <ul className="space-y-1">
                {churn_analysis.insights.map((insight, i) => (
                  <li key={i} className="text-sm text-rose-200/80 flex items-start gap-2">
                    <span className="text-rose-400 mt-1">•</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* RFM Segmentation */}
        {rfm_segmentation?.applicable && (
          <Card className="bg-amber-950/20 border-amber-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-amber-300">
                <Users className="h-4 w-4" />
                Segmentación de Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-3">
                {rfm_segmentation.segments?.map((seg) => (
                  <div key={seg.name} className="flex items-center justify-between">
                    <span className="text-sm text-amber-200/80">{seg.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-amber-300">{seg.count} ({seg.percentage}%)</span>
                      <div className="w-20 h-2 bg-amber-950 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500/60 rounded-full"
                          style={{ width: `${seg.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <ul className="space-y-1">
                {rfm_segmentation.insights.slice(0, 3).map((insight, i) => (
                  <li key={i} className="text-sm text-amber-200/80 flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Predictions */}
        {predictions?.applicable && (
          <Card className="bg-emerald-950/20 border-emerald-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-emerald-300">
                <TrendingUp className="h-4 w-4" />
                Predicciones ML
              </CardTitle>
              <CardDescription className="text-emerald-200/60 text-xs">
                {predictions.target_column && `Target: ${predictions.target_column}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {predictions.r2_score !== undefined && (
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-emerald-200">Precisión del modelo (R²)</span>
                    <span className="font-bold text-emerald-300">{Math.round(predictions.r2_score * 100)}%</span>
                  </div>
                  <Progress 
                    value={predictions.r2_score * 100} 
                    className="h-2 bg-emerald-950"
                  />
                </div>
              )}
              <ul className="space-y-1">
                {predictions.insights.map((insight, i) => (
                  <li key={i} className="text-sm text-emerald-200/80 flex items-start gap-2">
                    <span className="text-emerald-400 mt-1">•</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Clustering */}
        {clustering?.applicable && (
          <Card className="bg-violet-950/20 border-violet-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2 text-violet-300">
                <Target className="h-4 w-4" />
                Clustering Automático
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-3">
                {clustering.clusters?.map((cluster) => (
                  <div key={cluster.id} className="flex items-center justify-between">
                    <span className="text-sm text-violet-200/80">{cluster.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-violet-300">{cluster.count} ({cluster.percentage}%)</span>
                      <div className="w-20 h-2 bg-violet-950 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-violet-500/60 rounded-full"
                          style={{ width: `${cluster.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <ul className="space-y-1">
                {clustering.insights.map((insight, i) => (
                  <li key={i} className="text-sm text-violet-200/80 flex items-start gap-2">
                    <span className="text-violet-400 mt-1">•</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* No advanced analytics detected */}
      {!churn_analysis?.detected && !rfm_segmentation?.applicable && !predictions?.applicable && !clustering?.applicable && (
        <Card className="bg-neutral-900/50 border-white/10">
          <CardContent className="p-6 text-center">
            <BarChart3 className="h-8 w-8 text-neutral-500 mx-auto mb-3" />
            <p className="text-neutral-400 text-sm">
              Análisis avanzados no aplicables para este dataset.
              <br />
              <span className="text-neutral-500 text-xs">
                Se requieren columnas numéricas o específicas para churn/RFM.
              </span>
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

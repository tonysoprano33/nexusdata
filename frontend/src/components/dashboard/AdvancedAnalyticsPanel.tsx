"use client";
import { Brain, AlertTriangle, Users, TrendingUp, Target } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AnalysisResponse } from "@/types/analysis";

export function AdvancedAnalyticsPanel({ data }: { data: NonNullable<AnalysisResponse["result"]>["advanced_analytics"] }) {
  if (!data) return null;
  const { churn_analysis, rfm_segmentation, predictions, clustering } = data;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Brain className="w-5 h-5 text-violet-400" />
        <h3 className="text-lg font-semibold text-white">Advanced Analytics</h3>
        <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-xs uppercase tracking-wider">ML Powered</Badge>     
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {churn_analysis?.detected && (
          <Card className="bg-rose-950/10 border-rose-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-rose-300">
                <AlertTriangle className="w-4 h-4" /> Churn Risk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-400">{churn_analysis.churn_rate}%</div>
              <p className="text-xs text-rose-300/70">of customers at risk</p>
            </CardContent>
          </Card>
        )}

        {rfm_segmentation?.applicable && (
          <Card className="bg-amber-950/10 border-amber-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-amber-300">
                <Users className="w-4 h-4" /> RFM Segments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {rfm_segmentation.segments?.slice(0, 3).map((seg: any) => (      
                  <div key={seg.name} className="flex justify-between text-xs">
                    <span className="text-amber-200/80">{seg.name}</span>
                    <span className="text-amber-400">{seg.percentage}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {predictions?.applicable && (
          <Card className="bg-emerald-950/10 border-emerald-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-emerald-300">
                <TrendingUp className="w-4 h-4" /> ML Prediction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-400">{Math.round((predictions.r2_score || 0) * 100)}%</div>
              <p className="text-xs text-emerald-300/70">model accuracy (R²)</p>
            </CardContent>
          </Card>
        )}

        {clustering?.applicable && (
          <Card className="bg-violet-950/10 border-violet-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-violet-300">
                <Target className="w-4 h-4" /> Clusters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-violet-400">{clustering.clusters?.length || 0}</div>      
              <p className="text-xs text-violet-300/70">distinct groups found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

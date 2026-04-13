"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, 
  Sparkles, 
  Zap, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle,
  ExternalLink,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface IntelligenceCardProps {
  insights?: string;
  isLoading?: boolean;
  onRefresh?: () => void;
  confidenceScore?: number;
  lastUpdated?: string;
}

export function IntelligenceCard({ 
  insights, 
  isLoading, 
  onRefresh,
  confidenceScore = 92,
  lastUpdated = "Hace 2 minutos"
}: IntelligenceCardProps) {
  
  // Parse insights to extract key points
  const parseInsights = (text: string) => {
    if (!text || text.includes('Insight Engine Disabled')) return null;
    
    // Split by common markdown patterns
    const points = text.split(/\n\n|\n/).filter(p => p.trim().length > 0);
    return points.slice(0, 4); // Get top 4 points
  };

  const keyPoints = insights ? parseInsights(insights) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
    >
      <Card className="bg-gradient-to-br from-[#1a1a2e] to-[#16162a] border-violet-500/20 overflow-hidden">
        {/* Header */}
        <CardHeader className="pb-3 border-b border-violet-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-violet-500/20 blur-xl rounded-full" />
                <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
                  Intelligence Layer
                  <Badge 
                    variant="outline" 
                    className="bg-violet-500/10 text-violet-300 border-violet-500/30 text-xs"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Powered
                  </Badge>
                </CardTitle>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Powered by Gemini Flash • {lastUpdated}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {onRefresh && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onRefresh}
                  disabled={isLoading}
                  className="border-violet-500/30 text-violet-300 hover:bg-violet-500/10 h-8"
                >
                  <RefreshCw className={cn("w-4 h-4 mr-1.5", isLoading && "animate-spin")} />
                  Refresh
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-500/20 animate-pulse" />
                <div className="h-4 w-48 bg-violet-500/20 rounded animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-violet-500/10 rounded animate-pulse" />
                <div className="h-3 w-5/6 bg-violet-500/10 rounded animate-pulse" />
                <div className="h-3 w-4/6 bg-violet-500/10 rounded animate-pulse" />
              </div>
            </div>
          ) : !keyPoints ? (
            <div className="p-6">
              <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-amber-200">
                    API Key Required
                  </p>
                  <p className="text-xs text-amber-200/70">
                    Configure your GEMINI_API_KEY to unlock AI-powered insights and analysis.
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="mt-2 border-amber-500/30 text-amber-300 hover:bg-amber-500/10 h-7 text-xs"
                  >
                    <ExternalLink className="w-3 h-3 mr-1.5" />
                    Get API Key
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="p-6 space-y-5">
                {/* Confidence Score */}
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-neutral-400">Analysis Confidence</span>
                      <span className="text-xs font-semibold text-violet-400">{confidenceScore}%</span>
                    </div>
                    <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${confidenceScore}%` }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Key Insights */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-neutral-300 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Key Findings
                  </h4>
                  
                  <div className="space-y-2">
                    {keyPoints.map((point, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:border-violet-500/20 transition-colors"
                      >
                        <div className="w-5 h-5 rounded-full bg-violet-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-semibold text-violet-400">{index + 1}</span>
                        </div>
                        <div className="text-sm text-neutral-300 prose prose-invert prose-sm max-w-none">
                          <ReactMarkdown>{point}</ReactMarkdown>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Actionable Recommendations */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-neutral-300 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Recommended Actions
                  </h4>
                  
                  <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-emerald-200/80">
                        Based on the analysis, consider reviewing the correlation patterns identified 
                        in your data to optimize business decisions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

"use client";
import { useState } from "react";
import { Brain, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";

interface AIInsightsPanelProps {
  insights: string;
}

export function AIInsightsPanel({ insights }: AIInsightsPanelProps) {
  const [expanded, setExpanded] = useState(true);

  if (!insights || insights.includes("Insight Engine Disabled") || insights.includes("Error en análisis")) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-indigo-500/5 via-violet-500/5 to-transparent border-indigo-500/20 relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Brain className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                AI Business Insights
                <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[10px] uppercase tracking-wider">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Gemini
                </Badge>
              </h2>
              <p className="text-xs text-neutral-500">Análisis ejecutivo generado por IA</p>
            </div>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 rounded-lg hover:bg-white/5 text-neutral-400 hover:text-white transition-colors"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        {/* Content */}
        {expanded && (
          <div className="prose prose-invert prose-sm max-w-none
            prose-headings:text-white prose-headings:font-semibold prose-headings:text-base prose-headings:mt-4 prose-headings:mb-2
            prose-p:text-neutral-300 prose-p:leading-relaxed prose-p:my-1
            prose-li:text-neutral-300 prose-li:my-0.5
            prose-ul:my-1 prose-ul:pl-4
            prose-strong:text-white prose-strong:font-semibold
            [&_h3]:flex [&_h3]:items-center [&_h3]:gap-2 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-white [&_h3]:border-b [&_h3]:border-white/5 [&_h3]:pb-2 [&_h3]:mb-3
          ">
            <ReactMarkdown>{insights}</ReactMarkdown>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
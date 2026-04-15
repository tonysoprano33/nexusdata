"use client";

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Brain, Sparkles, TrendingUp, AlertTriangle, 
  Lightbulb, CheckCircle2, ChevronDown, ChevronUp 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AIInsightsPanelProps {
  insights: string;
}

const SECTION_ICONS: Record<string, React.ReactNode> = {
  principal: <Brain className="w-5 h-5" />,
  ejecutivo: <CheckCircle2 className="w-5 h-5" />,
  clave: <TrendingUp className="w-5 h-5" />,
  riesgos: <AlertTriangle className="w-5 h-5" />,
  recomendaciones: <Lightbulb className="w-5 h-5" />,
};

function parseInsights(text: string) {
  const sections: { title: string; content: string }[] = [];
  const lines = text.split("\n");
  let currentTitle = "";
  let currentContent: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("### ")) {
      if (currentTitle) {
        sections.push({ title: currentTitle, content: currentContent.join("\n") });
      }
      currentTitle = trimmed.replace("### ", "").trim();
      currentContent = [];
    } else if (trimmed) {
      currentContent.push(trimmed);
    }
  }

  if (currentTitle) {
    sections.push({ title: currentTitle, content: currentContent.join("\n") });
  }

  // Fallback si no se parseó nada
  if (sections.length === 0 && text.trim()) {
    return [{ title: "AI Business Insights", content: text.trim() }];
  }

  return sections;
}

export function AIInsightsPanel({ insights }: AIInsightsPanelProps) {
  const [expanded, setExpanded] = useState(true);

  if (!insights || insights.trim() === "") {
    return null;
  }

  if (insights.includes("Error")) {
    return (
      <Card className="bg-neutral-900 border-rose-500/30 p-6">
        <p className="text-rose-400 text-sm">{insights}</p>
      </Card>
    );
  }

  const sections = parseInsights(insights);

  return (
    <Card className="bg-[#0a0a0a] border-neutral-800 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-neutral-800 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-9 w-9 bg-blue-500/10 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">AI Business Insights</h2>
            <p className="text-xs text-neutral-500">Análisis estratégico generado por IA</p>
          </div>
        </div>

        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
          Groq • Llama 3.3
        </Badge>
      </div>

      <CardContent className="p-6">
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              {sections.map((section, index) => {
                const lowerTitle = section.title.toLowerCase();
                let icon = SECTION_ICONS["clave"];
                let color = "text-violet-400";

                if (lowerTitle.includes("principal")) { icon = SECTION_ICONS["principal"]; color = "text-cyan-400"; }
                else if (lowerTitle.includes("ejecutivo") || lowerTitle.includes("resumen")) { icon = SECTION_ICONS["ejecutivo"]; color = "text-indigo-400"; }
                else if (lowerTitle.includes("clave")) { icon = SECTION_ICONS["clave"]; color = "text-violet-400"; }
                else if (lowerTitle.includes("riesgo")) { icon = SECTION_ICONS["riesgos"]; color = "text-amber-400"; }
                else if (lowerTitle.includes("recomendacion")) { icon = SECTION_ICONS["recomendaciones"]; color = "text-emerald-400"; }

                return (
                  <div key={index} className="border border-neutral-800 rounded-2xl p-6 bg-neutral-900/50">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 rounded-lg bg-neutral-800 ${color.replace("text-", "text-")}`}>
                        {icon}
                      </div>
                      <h3 className={`font-semibold text-lg ${color}`}>
                        {section.title}
                      </h3>
                    </div>

                    <div className="prose prose-invert prose-neutral max-w-none text-neutral-200 leading-relaxed">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {section.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
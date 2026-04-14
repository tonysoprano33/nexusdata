"use client";
import { useState } from "react";
import { Brain, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AIInsightsPanelProps {
  insights: string;
}

function parseInsights(text: string) {
  const sections: { title: string; items: string[] }[] = [];
  const lines = text.split("\n").filter(l => l.trim());

  let current: { title: string; items: string[] } | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Detectar encabezados (### o **)
    if (trimmed.startsWith("###") || (trimmed.startsWith("**") && trimmed.endsWith("**"))) {
      if (current) sections.push(current);
      const title = trimmed.replace(/^###\s*/, "").replace(/\*\*/g, "").trim();
      current = { title, items: [] };
    } else if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
      const item = trimmed.replace(/^[-*]\s*/, "").replace(/\*\*/g, "").trim();
      if (item && current) current.items.push(item);
    } else if (trimmed && current) {
      // Línea de texto sin bullet
      const clean = trimmed.replace(/\*\*/g, "").trim();
      if (clean) current.items.push(clean);
    }
  }

  if (current) sections.push(current);
  return sections;
}

const SECTION_STYLES: Record<string, { icon: string; color: string; bg: string; border: string }> = {
  default: { icon: "📊", color: "text-blue-400", bg: "bg-blue-500/5", border: "border-blue-500/20" },
  resumen: { icon: "🧠", color: "text-indigo-400", bg: "bg-indigo-500/5", border: "border-indigo-500/20" },
  insight: { icon: "🔍", color: "text-violet-400", bg: "bg-violet-500/5", border: "border-violet-500/20" },
  patron: { icon: "📊", color: "text-cyan-400", bg: "bg-cyan-500/5", border: "border-cyan-500/20" },
  anomal: { icon: "⚠️", color: "text-amber-400", bg: "bg-amber-500/5", border: "border-amber-500/20" },
  recom: { icon: "💡", color: "text-emerald-400", bg: "bg-emerald-500/5", border: "border-emerald-500/20" },
};

function getSectionStyle(title: string) {
  const t = title.toLowerCase();
  if (t.includes("resumen")) return SECTION_STYLES.resumen;
  if (t.includes("insight") || t.includes("clave")) return SECTION_STYLES.insight;
  if (t.includes("patr")) return SECTION_STYLES.patron;
  if (t.includes("anomal") || t.includes("riesgo")) return SECTION_STYLES.anomal;
  if (t.includes("recom")) return SECTION_STYLES.recom;
  return SECTION_STYLES.default;
}

export function AIInsightsPanel({ insights }: AIInsightsPanelProps) {
  const [expanded, setExpanded] = useState(true);

  if (!insights || insights.includes("Insight Engine Disabled") || insights.includes("Error en análisis")) {
    return null;
  }

  const sections = parseInsights(insights);

  return (
    <Card className="bg-gradient-to-br from-indigo-500/5 via-violet-500/5 to-transparent border-indigo-500/20 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
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

        {/* Sections */}
        {expanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sections.map((section, i) => {
              const style = getSectionStyle(section.title);
              return (
                <div
                  key={i}
                  className={`rounded-xl p-4 ${style.bg} border ${style.border}`}
                >
                  <h3 className={`text-sm font-semibold ${style.color} mb-3 flex items-center gap-2`}>
                    <span>{style.icon}</span>
                    {section.title}
                  </h3>
                  <ul className="space-y-2">
                    {section.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <span className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${style.color.replace("text-", "bg-")}`} />
                        <span className="text-sm text-neutral-300 leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
"use client";
import { useState } from "react";
import { Brain, ChevronDown, ChevronUp, Sparkles, CheckCircle2, TrendingUp, AlertTriangle, Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface AIInsightsPanelProps {
  insights: string;
}

function parseInsights(text: string) {
  const sections: { title: string; items: string[] }[] = [];
  const lines = text.split("\n");

  let current: { title: string; items: string[] } | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Detectar títulos (### o **texto**)
    if (trimmed.startsWith("###") || (trimmed.startsWith("**") && trimmed.endsWith("**"))) {
      if (current) sections.push(current);

      let title = trimmed
        .replace(/^###\s*/, "")
        .replace(/\*\*/g, "")
        .trim();

      // Limpiar emojis comunes
      title = title.replace(/^[🚀🧠🔍⚠️💡]\s*/, "").trim();

      current = { title, items: [] };
      continue;
    }

    // Detectar items de lista
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const item = trimmed.replace(/^[-*]\s*/, "").trim();
      if (item && current) {
        current.items.push(item);
      }
    } 
    // Texto normal que pertenece a la sección actual
    else if (trimmed && current && !trimmed.startsWith("###") && !trimmed.startsWith("**")) {
      const clean = trimmed.replace(/\*\*/g, "").trim();
      if (clean.length > 5) {  // evitar líneas muy cortas
        current.items.push(clean);
      }
    }
  }

  if (current) sections.push(current);

  // Si no logró parsear nada, devolver todo como un solo bloque
  if (sections.length === 0 && text.trim()) {
    return [{
      title: "AI Business Insights",
      items: [text.trim()]
    }];
  }

  return sections;
}

const SECTION_STYLES: Record<string, { icon: any; color: string; bg: string; border: string; accent: string }> = {
  default: { icon: Sparkles, color: "text-blue-400", bg: "bg-blue-500/5", border: "border-blue-500/10", accent: "bg-blue-500/20" },
  resumen: { icon: CheckCircle2, color: "text-indigo-400", bg: "bg-indigo-500/5", border: "border-indigo-500/10", accent: "bg-indigo-500/20" },   
  insight: { icon: TrendingUp, color: "text-violet-400", bg: "bg-violet-500/5", border: "border-violet-500/10", accent: "bg-violet-500/20" },    
  principal: { icon: Brain, color: "text-cyan-400", bg: "bg-cyan-500/5", border: "border-cyan-500/10", accent: "bg-cyan-500/20" },
  riesgos: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/5", border: "border-amber-500/10", accent: "bg-amber-500/20" },      
  recomendaciones: { icon: Lightbulb, color: "text-emerald-400", bg: "bg-emerald-500/5", border: "border-emerald-500/10", accent: "bg-emerald-500/20" },  
};

function getSectionStyle(title: string) {
  const t = title.toLowerCase();
  if (t.includes("resumen") || t.includes("ejecutivo")) return SECTION_STYLES.resumen;
  if (t.includes("principal") || t.includes("insight principal")) return SECTION_STYLES.principal;
  if (t.includes("insight") || t.includes("clave")) return SECTION_STYLES.insight;
  if (t.includes("riesgo") || t.includes("anomal")) return SECTION_STYLES.riesgos;
  if (t.includes("recomendacion") || t.includes("recomendación")) return SECTION_STYLES.recomendaciones;
  return SECTION_STYLES.default;
}

export function AIInsightsPanel({ insights }: AIInsightsPanelProps) {
  const [expanded, setExpanded] = useState(true);

  if (!insights || insights.trim() === "") {
    return null;
  }

  if (insights.includes("Error generando insights") || insights.includes("Missing GEMINI_API_KEY")) {
    return (
      <Card className="bg-neutral-900 border-rose-500/20 p-6">
        <p className="text-rose-400 text-sm">{insights}</p>
      </Card>
    );
  }

  const sections = parseInsights(insights);

  return (
    <Card className="bg-[#0f0f0f] border-neutral-800 relative overflow-hidden transition-all duration-500 group shadow-2xl">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-blue-500/10 transition-colors duration-700" />

      <CardContent className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-5">
            <div className="h-14 w-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-500">
              <Brain className="h-7 w-7 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  AI Business Insights
                </h2>
                <Badge variant="outline" className="bg-blue-500/5 text-blue-400 border-blue-500/20 px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" />
                  Gemini
                </Badge>
              </div>
              <p className="text-[15px] text-neutral-400 font-medium">Análisis estratégico para toma de decisiones</p>
            </div>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="h-10 w-10 flex items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 transition-all shadow-lg"     
          >
            {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>

        {/* Content */}
        <AnimatePresence>
          {expanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {sections.map((section, i) => {
                  const style = getSectionStyle(section.title);
                  const Icon = style.icon;

                  return (
                    <motion.div
                      key={i}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: i * 0.08 }}
                      className={cn(
                        "rounded-2xl p-6 border transition-all duration-300 group/section",
                        style.bg,
                        style.border,
                        "hover:shadow-xl hover:shadow-black/40 hover:-translate-y-1"
                      )}
                    >
                      <div className="flex items-center gap-3 mb-5">
                        <div className={cn("p-2 rounded-lg", style.accent)}>
                          <Icon className={cn("w-5 h-5", style.color)} />
                        </div>
                        <h3 className={cn("text-lg font-bold tracking-tight", style.color)}>
                          {section.title}
                        </h3>
                      </div>
                      
                      <ul className="space-y-4 text-[15px] text-neutral-200 leading-relaxed">
                        {section.items.map((item, j) => (
                          <li key={j} className="flex items-start gap-3">
                            <div className={cn("mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0", 
                              style.color.replace("text-", "bg-"))} />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
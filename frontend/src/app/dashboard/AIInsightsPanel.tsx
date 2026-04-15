"use client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion} from "framer-motion";
import { 
  Brain, Sparkles, TrendingUp, AlertTriangle, 
  Lightbulb, CheckCircle2, Cpu, Zap
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
      if (currentTitle) sections.push({ title: currentTitle, content: currentContent.join("\n") });
      currentTitle = trimmed.replace("### ", "").trim();
      currentContent = [];
    } else if (trimmed) {
      currentContent.push(trimmed);
    }
  }
  if (currentTitle) sections.push({ title: currentTitle, content: currentContent.join("\n") });
  if (sections.length === 0 && text.trim()) return [{ title: "AI Business Strategy", content: text.trim() }];
  return sections;
}

export function AIInsightsPanel({ insights }: AIInsightsPanelProps) {
  if (!insights || insights.trim() === "") return null;

  const sections = parseInsights(insights);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-widest">Neural Strategy Engine</h3>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] mt-1">High-fidelity strategic extraction</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05]">
             <Cpu className="w-3.5 h-3.5 text-zinc-500" />
             <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Llama 3.3 • Groq</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((section, index) => {
          const lowerTitle = section.title.toLowerCase();
          let colorClass = "text-blue-400";
          let bgClass = "bg-blue-500/5 border-blue-500/10";
          
          if (lowerTitle.includes("riesgo")) { colorClass = "text-rose-400"; bgClass = "bg-rose-500/5 border-rose-500/10"; }
          else if (lowerTitle.includes("recomendacion")) { colorClass = "text-emerald-400"; bgClass = "bg-emerald-500/5 border-emerald-500/10"; }
          else if (lowerTitle.includes("clave")) { colorClass = "text-purple-400"; bgClass = "bg-purple-500/5 border-purple-500/10"; }

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={cn("relative p-8 rounded-[2rem] border backdrop-blur-md overflow-hidden", bgClass)}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", bgClass)}>
                   <Zap className={cn("w-5 h-5", colorClass)} />
                </div>
                <h4 className={cn("font-black text-sm uppercase tracking-[0.2em]", colorClass)}>
                  {section.title}
                </h4>
              </div>

              <div className="prose prose-invert prose-zinc max-w-none text-zinc-300 text-sm font-medium leading-relaxed">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {section.content}
                </ReactMarkdown>
              </div>

              <div className="mt-8 flex justify-end">
                <div className="flex items-center gap-2 opacity-30">
                   <div className="w-1 h-1 rounded-full bg-current" />
                   <span className="text-[9px] font-black uppercase tracking-widest">Verified Insight</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Sparkles, TrendingUp, AlertTriangle,
  Lightbulb, CheckCircle2, Cpu, Zap, ShieldCheck, Info, ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AIInsightsPanelProps {
  insights: string;
  totalRows?: number;
}

function parseInsights(text: string) {
  const sections: { title: string; content: string; keyFindings: string[] }[] = [];
  
  // Known section patterns to detect
  const sectionPatterns = [
    { pattern: /key insights/i, title: "Key Insights", icon: "TrendingUp" },
    { pattern: /data.*patterns/i, title: "Data Patterns", icon: "TrendingUp" },
    { pattern: /notable trends|trends.*correlations/i, title: "Trends & Correlations", icon: "Zap" },
    { pattern: /data quality.*observations/i, title: "Data Quality", icon: "ShieldCheck" },
    { pattern: /actionable recommendations|business decisions/i, title: "Recommendations", icon: "Lightbulb" },
    { pattern: /additional analysis|suggestions/i, title: "Further Analysis", icon: "Brain" },
    { pattern: /executive summary|summary/i, title: "Executive Summary", icon: "CheckCircle2" },
    { pattern: /risk|critical|alert/i, title: "Risk Assessment", icon: "AlertTriangle" },
  ];
  
  // First try to split by markdown headers (### ## #)
  const headerRegex = /^(#{1,3}\s+.+|(?:\*\*)?[^:\n]+:(?:\*\*)?)$/gm;
  const matches = [...text.matchAll(headerRegex)];
  
  if (matches.length >= 2) {
    // We have headers, use them
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const startIdx = match.index!;
      const endIdx = i < matches.length - 1 ? matches[i + 1].index! : text.length;
      const sectionText = text.slice(startIdx, endIdx).trim();
      
      const headerLine = match[0].replace(/^#+\s+/, '').replace(/\*\*/g, '').replace(/:$/, '').trim();
      const content = sectionText.replace(match[0], '').trim();
      
      if (headerLine && content) {
        sections.push({ title: headerLine, content, keyFindings: [] });
      }
    }
  }
  
  // If no sections found with headers, try pattern matching
  if (sections.length === 0) {
    const lines = text.split('\n');
    let currentTitle = "";
    let currentContent: string[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      // Check if line looks like a section header
      const isHeader = sectionPatterns.some(p => p.pattern.test(trimmed)) ||
                       trimmed.match(/^(?:\*\*)?[^:\n]{3,60}:(?:\*\*)?$/) ||
                       trimmed.match(/^#{1,3}\s+.+$/);
      
      if (isHeader) {
        if (currentTitle && currentContent.length > 0) {
          sections.push({ 
            title: currentTitle, 
            content: currentContent.join('\n').trim(), 
            keyFindings: [] 
          });
        }
        currentTitle = trimmed.replace(/^#+\s+/, '').replace(/\*\*/g, '').replace(/:$/, '').trim();
        currentContent = [];
      } else if (currentTitle) {
        currentContent.push(trimmed);
      }
    }
    
    // Add last section
    if (currentTitle && currentContent.length > 0) {
      sections.push({ 
        title: currentTitle, 
        content: currentContent.join('\n').trim(), 
        keyFindings: [] 
      });
    }
  }
  
  // If still no sections, create them from the text structure
  if (sections.length === 0 && text.trim()) {
    // Try to split by double newlines (paragraph groups)
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 20);
    if (paragraphs.length >= 2) {
      sections.push({ 
        title: "Key Insights About the Data", 
        content: paragraphs.slice(0, 2).join('\n\n'), 
        keyFindings: [] 
      });
      if (paragraphs.length > 2) {
        sections.push({ 
          title: "Trends and Patterns", 
          content: paragraphs.slice(2, 4).join('\n\n'), 
          keyFindings: [] 
        });
      }
      if (paragraphs.length > 4) {
        sections.push({ 
          title: "Recommendations", 
          content: paragraphs.slice(4).join('\n\n'), 
          keyFindings: [] 
        });
      }
    } else {
      sections.push({ title: "AI Business Strategy", content: text.trim(), keyFindings: [] });
    }
  }

  // Extract top findings globally for the scanable block
  const globalFindings: string[] = [];
  
  // Extract numbered findings and key statistics
  const allLines = text.split('\n');
  for (const line of allLines) {
    const trimmed = line.trim();
    // Look for lines with numbers, percentages, or key metrics
    const hasMetrics = /\d/.test(trimmed) && (/%|cases|outbreak|correlation|distribution/i.test(trimmed));
    const isBullet = trimmed.match(/^[-*•]\s+/);
    const isNumbered = trimmed.match(/^\d+[.)]\s+/);
    
    if ((isBullet || isNumbered || hasMetrics) && trimmed.length > 20 && trimmed.length < 150) {
      const clean = trimmed.replace(/^[-*•\d.)]+\s+/, '').replace(/\*\*/g, '');
      if (!globalFindings.includes(clean)) {
        globalFindings.push(clean);
      }
    }
    if (globalFindings.length >= 3) break;
  }
  
  // If no findings, extract first meaningful sentences
  if (globalFindings.length === 0) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 30 && s.trim().length < 120);
    globalFindings.push(...sentences.slice(0, 3).map(s => s.trim()));
  }

  return { sections, globalFindings };
}

function getConfidence(title: string, index: number): { level: "High" | "Medium" | "Low"; color: string } {
  const lower = title.toLowerCase();
  if (lower.includes("principal") || index === 0) return { level: "High", color: "emerald" };
  if (lower.includes("riesgo") || lower.includes("risk")) return { level: "Medium", color: "amber" };
  if (lower.includes("recomendacion") || lower.includes("recommendation")) return { level: "High", color: "emerald" };
  return { level: "Medium", color: "amber" };
}

function getSectionStyle(title: string) {
  const lower = title.toLowerCase();
  if (lower.includes("riesgo") || lower.includes("risk") || lower.includes("critico")) {
    return { color: "text-rose-400", bg: "bg-rose-500/5 border-rose-500/15", icon: AlertTriangle };
  }
  if (lower.includes("recomendacion") || lower.includes("recommendation")) {
    return { color: "text-emerald-400", bg: "bg-emerald-500/5 border-emerald-500/15", icon: Lightbulb };
  }
  if (lower.includes("clave") || lower.includes("key") || lower.includes("insight")) {
    return { color: "text-purple-400", bg: "bg-purple-500/5 border-purple-500/15", icon: TrendingUp };
  }
  if (lower.includes("ejecutivo") || lower.includes("resumen")) {
    return { color: "text-sky-400", bg: "bg-sky-500/5 border-sky-500/15", icon: CheckCircle2 };
  }
  return { color: "text-blue-400", bg: "bg-blue-500/5 border-blue-500/15", icon: Brain };
}

function InsightCard({ section, validRows, index }: { section: any, validRows: number, index: number }) {
  const [expanded, setExpanded] = useState(false);
  const style = getSectionStyle(section.title);
  const confidence = getConfidence(section.title, index);
  const Icon = style.icon;

  const confColors: Record<string, string> = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
  };

  const confidenceTooltips: Record<string, string> = {
    High: "High confidence data patterns detected with multiple corroborating variables.",
    Medium: "Medium confidence: AI deduced this from partial historical trends.",
    Low: "Low confidence: requires human validation."
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className={cn(
        "rounded-2xl border flex flex-col relative overflow-hidden transition-all duration-300",
        style.bg,
        expanded ? "shadow-2xl" : "hover:bg-white/[0.02]"
      )}
    >
      {/* Section header */}
      <div 
        className="flex items-start justify-between gap-3 p-6 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className={cn("w-9 h-9 rounded-xl border flex items-center justify-center shrink-0", style.bg)}>
            <Icon className={cn("w-4 h-4", style.color)} />
          </div>
          <h4 className={cn("font-black text-sm uppercase tracking-wide leading-tight", style.color)}>
            {section.title}
          </h4>
        </div>
        <button 
           className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
        >
           <ChevronDown className={cn("w-5 h-5 text-zinc-500 transition-transform duration-300", expanded ? "rotate-180" : "rotate-0")} />
        </button>
      </div>

      {/* Content wrapper */}
      <AnimatePresence initial={false}>
         {expanded ? (
            <motion.div
               key="content"
               initial={{ height: 0, opacity: 0 }}
               animate={{ height: "auto", opacity: 1 }}
               exit={{ height: 0, opacity: 0 }}
               transition={{ duration: 0.3, ease: "easeInOut" }}
               className="overflow-hidden"
            >
               <div className="px-6 pb-6 prose prose-invert prose-zinc max-w-none text-zinc-300 text-sm font-medium leading-relaxed border-t border-white/[0.04] pt-4">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {section.content}
                  </ReactMarkdown>
               </div>
            </motion.div>
         ) : (
            <div className="px-6 pb-6 relative overflow-hidden">
               <div className="prose prose-invert prose-zinc max-w-none text-zinc-400 text-sm font-medium line-clamp-2">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {section.content}
                  </ReactMarkdown>
               </div>
               {/* Fade out bottom overlay */}
               <div className="absolute bottom-6 left-0 right-0 h-6 bg-gradient-to-t from-zinc-950/80 to-transparent pointer-events-none" />
            </div>
         )}
      </AnimatePresence>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/[0.04] bg-black/20 flex items-center justify-between gap-3 mt-auto flex-wrap">
        <div className="flex items-center gap-2 group relative">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
            Confidence
          </span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.05] cursor-help">
             <span className={cn("w-2 h-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]", confColors[confidence.color], `shadow-${confidence.color}-500/50`)} />
             <span className="text-[9px] font-black uppercase text-zinc-400">{confidence.level}</span>
          </div>
          
          {/* Tooltip */}
          <div className="absolute bottom-full left-0 mb-2 w-48 p-2 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
             {confidenceTooltips[confidence.level]}
          </div>
        </div>

        {validRows > 0 && (
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-600 font-medium pb-px">
            <Info className="w-3 h-3" />
            Analyzed {validRows.toLocaleString()} rows
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function AIInsightsPanel({ insights, totalRows }: AIInsightsPanelProps) {
  if (!insights || insights.trim() === "") return null;

  const { sections, globalFindings } = parseInsights(insights);
  const validRows = totalRows ?? 0;

  return (
    <div className="space-y-8">
      {/* Top 3 Scanable Findings */}
      {globalFindings.length > 0 && (
         <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-500/10 to-transparent p-6">
            <div className="flex items-center gap-2 mb-4">
               <Zap className="w-4 h-4 text-amber-400" />
               <h4 className="text-xs font-black uppercase tracking-widest text-white">Top Findings Overview</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               {globalFindings.slice(0, 3).map((finding, idx) => (
                  <div key={idx} className="flex gap-3 items-start border-l-2 border-blue-500/30 pl-4 py-1">
                     <span className="text-blue-400 text-sm font-black mt-0.5">0{idx + 1}</span>
                     <p className="text-sm font-medium text-zinc-300 leading-tight">{finding}</p>
                  </div>
               ))}
            </div>
         </div>
      )}

      {/* Collapsible Sub-topic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
        {sections.map((section, index) => (
           <InsightCard 
              key={index} 
              section={section} 
              validRows={validRows} 
              index={index} 
           />
        ))}
      </div>
    </div>
  );
}

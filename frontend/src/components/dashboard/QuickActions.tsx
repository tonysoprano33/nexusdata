"use client";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Zap, Target, Users, Search, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
  prompt: string;
}

const actions: QuickAction[] = [
  { 
    id: "build_churn", 
    label: "Build churn model", 
    icon: Users, 
    color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    prompt: "Can you analyze the potential churn risk in this dataset and identify which factors are most correlated with users leaving?"
  },
  { 
    id: "detect_anomalies", 
    label: "Detect anomalies", 
    icon: AlertTriangle, 
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    prompt: "Run an anomaly detection on this dataset. Identify rows that behave like outliers and explain why they are considered anomalous."
  },
  { 
    id: "segment_customers", 
    label: "Segment customers", 
    icon: Target, 
    color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    prompt: "Perform a customer segmentation analysis. Group the data based on behavior patterns and describe each persona discovered."
  },
  { 
    id: "find_risks", 
    label: "Find hidden risks", 
    icon: Search, 
    color: "text-violet-400 bg-violet-500/10 border-violet-500/20",
    prompt: "What are the hidden risks in this data? Look for missing patterns, inconsistent distributions, or quality issues that could impact business decisions."
  }
];

export function QuickActions() {    
  return (
    <div className="mb-10">
      <div className="flex items-center gap-2 mb-4 px-2">
        <Sparkles className="w-4 h-4 text-blue-400" />
        <h3 className="text-xs font-black text-white uppercase tracking-widest">
          Suggested Next Steps
        </h3>
        <span className="text-[10px] font-bold text-zinc-500 ml-2">Click to Run Analysis</span>
      </div>

      <div className="flex flex-wrap gap-3">
        {actions.map((action, i) => (
          <motion.button
            key={action.id}
            onClick={() => {
                // Dispatch event to Chat
                window.dispatchEvent(new CustomEvent("quick-analysis", { 
                    detail: { prompt: action.prompt, label: action.label } 
                }));
                // Scroll to chat
                const el = document.getElementById("chat");
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="group flex items-center gap-3 px-4 py-3 rounded-2xl bg-zinc-950/60 border border-white/[0.05] hover:bg-zinc-900 transition-all active:scale-95 cursor-pointer text-left"
          >
            <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center border shrink-0", action.color)}>
              <action.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 pr-4">
              <p className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                {action.label}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
          </motion.button>
        ))}
      </div>
    </div>
  );
}
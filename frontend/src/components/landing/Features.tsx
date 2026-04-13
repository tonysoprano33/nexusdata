"use client";
import { motion } from "framer-motion";
import { Zap, BarChart2, ShieldCheck } from "lucide-react";

const mainFeatures = [
  { icon: Zap, title: "Async Processing", desc: "Backend processes without blocking the user experience." },
  { icon: BarChart2, title: "Cognitive Insights", desc: "AI analyzes correlations and drafts actionable findings." },
  { icon: ShieldCheck, title: "Data Quality", desc: "Get quality scores and early anomaly detection." },
];

const gridFeatures = [
  { icon: "📊", title: "Multiple Formats", desc: "CSV, Excel, JSON. Drag and drop ready." },        
  { icon: "🤖", title: "AI Integration", desc: "Automatic insights with Gemini AI." },
  { icon: "📈", title: "Visualizations", desc: "Auto-generated: scatter, boxplots, heatmaps." },
  { icon: "🎯", title: "Predictions", desc: "Forecasting and churn detection built-in." },    
  { icon: "💬", title: "Data Chat", desc: "Natural language interface for your dataset." },        
  { icon: "📄", title: "Full Export", desc: "PDF, PowerPoint, Excel. Presentation ready." },    
  { icon: "⚡", title: "Blazing Fast", desc: "Dashboard ready in less than 10 seconds." },
  { icon: "🔒", title: "Privacy First", desc: "Your data is never stored permanently." },
];

export function Features() {
  return (
    <>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6 pb-20">
        {mainFeatures.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/10 transition-all"
          >
            <f.icon className="h-8 w-8 text-indigo-400 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">{f.title}</h3>
            <p className="text-neutral-500 text-sm">{f.desc}</p>
          </motion.div>
        ))}
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-32">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            100% Free • Unlimited • No Registration
          </div>
          <h2 className="text-4xl font-bold tracking-tight mb-4">Advanced Free Analysis</h2>
          <p className="text-neutral-400 max-w-2xl mx-auto">Full AI power for your data, without costs or limits.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {gridFeatures.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/10 transition-all group"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">{f.icon}</div>
              <h3 className="text-lg font-medium text-white mb-2">{f.title}</h3>
              <p className="text-neutral-500 text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}

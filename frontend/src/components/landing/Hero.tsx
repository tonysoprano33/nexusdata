"use client";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

export function Hero() {
  return (
    <section className="max-w-5xl mx-auto pt-32 pb-20 px-6 flex flex-col items-center text-center relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-indigo-400 mb-8 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          AI Powered Analysis
        </div>
        <h1 className="text-6xl md:text-8xl font-medium tracking-tighter mb-6 bg-gradient-to-br from-white via-white to-white/40 text-transparent bg-clip-text">
          Data Insights <br /> Redefined.
        </h1>
        <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-10 font-light">
          Upload your dataset. Our engine cleans, analyzes, and interprets with advanced Machine Learning.
        </p>
      </motion.div>
    </section>
  );
}

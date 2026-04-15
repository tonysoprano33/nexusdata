"use client";

import { Hero } from "@/components/landing/Hero";
import { UploadSection } from "@/components/landing/UploadSection";
import { Features } from "@/components/landing/Features";
import { AnalysisHistory } from "@/components/landing/AnalysisHistory";
import { Sparkles, ArrowRight, Database, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="min-h-screen relative">
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl h-16 flex items-center justify-between px-6 rounded-2xl border border-white/[0.08] bg-black/40 backdrop-blur-xl z-[100] transition-all">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles className="text-white w-4 h-4" />
          </div>
          <span className="font-bold text-lg tracking-tight uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
            NexusData <span className="text-blue-500">AI</span>
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-1">
          {["Platform", "Solutions", "Inventory"].map((item) => (
            <Link 
              key={item}
              href={`#${item.toLowerCase()}`} 
              className="px-4 py-1.5 text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/[0.03] rounded-full transition-all"
            >
              {item}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/datasets">
            <Button variant="ghost" className="hidden sm:flex text-zinc-400 hover:text-white hover:bg-white/[0.03] text-xs font-bold px-4 rounded-xl">
              Sign In
            </Button>
          </Link>
          <Link href="/datasets">
            <Button className="bg-white text-black hover:bg-zinc-200 font-bold h-9 px-5 rounded-xl text-xs shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 transition-all">
              Dashboard <ArrowRight className="w-3.5 h-3.5 ml-2" />
            </Button>
          </Link>
        </div>
      </nav>

      <section className="pt-32 pb-16">
        <Hero />
      </section>

      <section id="upload" className="relative z-10 py-12 px-6 max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative group p-[1px] rounded-[2.5rem] bg-gradient-to-b from-white/[0.12] to-transparent shadow-2xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-[#080808] rounded-[2.5rem] m-[1px]" />
          <div className="relative p-8 sm:p-12 lg:p-16">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Nexus Engine Core</h2>
                <p className="text-zinc-400 text-sm max-w-md">Drop your raw datasets here. Our neural synthesis engine will clean, map, and extract insights automatically.</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.05]">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Secure TLS 1.3</span>
                </div>
              </div>
            </div>
            <UploadSection />
          </div>
        </motion.div>
      </section>

      <section id="platform" className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center mb-16 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Next-Gen Intelligence</span>
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-white mb-4">Transforming Chaos into Strategy</h2>
            <p className="text-zinc-400 max-w-2xl">NexusData isn't just a cleaner. It's an analyst that identifies trends, detects anomalies, and suggests the best paths for your data.</p>
          </div>
          <Features />
        </div>
      </section>

      <section id="inventory" className="pb-32 px-6 sm:px-12 max-w-[1400px] mx-auto">
        <div className="flex items-center gap-3 mb-10 px-4">
          <Database className="w-5 h-5 text-blue-500" />
          <h3 className="text-xl font-bold tracking-tight text-white">Processed Datasets</h3>
          <div className="h-[1px] flex-grow bg-gradient-to-r from-white/[0.1] to-transparent ml-4" />
        </div>
        <AnalysisHistory />
      </section>

      <footer className="w-full py-16 px-6 border-t border-white/[0.03] bg-[#050505]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                <Sparkles className="text-white w-4 h-4" />
              </div>
              <span className="font-bold text-lg tracking-tight uppercase">NexusData AI</span>
            </div>
            <p className="text-zinc-500 text-sm max-w-sm mb-8 leading-relaxed">
              Neural Synthesis Engine. Corporate-Grade Intelligence. Redefining how enterprises interact with complex data architectures.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm mb-6">Resources</h4>
            <ul className="space-y-4">
              {["Documentation", "API Reference", "Security Whitepaper", "Changelog"].map(link => (
                <li key={link} className="text-zinc-500 hover:text-blue-400 text-xs font-medium cursor-pointer transition-colors">{link}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm mb-6">System Status</h4>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">All Engines Operational</span>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/[0.03] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-600 text-[11px] font-medium tracking-wide uppercase">© 2026 Nexus Synthesis Corp. Distributed Intelligence.</p>
          <div className="flex gap-8">
            <span className="text-zinc-600 hover:text-white text-[11px] font-bold uppercase tracking-widest transition-colors cursor-pointer">Security</span>
            <span className="text-zinc-600 hover:text-white text-[11px] font-bold uppercase tracking-widest transition-colors cursor-pointer">Privacy</span>
            <span className="text-zinc-600 hover:text-white text-[11px] font-bold uppercase tracking-widest transition-colors cursor-pointer">Legal</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

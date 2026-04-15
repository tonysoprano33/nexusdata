"use client";
import { UploadSection } from "@/components/landing/UploadSection";
import { AnalysisHistory } from "@/components/landing/AnalysisHistory";
import { Database, ChevronRight, LayoutDashboard, Terminal, Activity, Shield, ArrowRight, Cpu, Globe, Binary } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-white/10 overflow-x-hidden">
      {/* Precision Navbar */}
      <nav className="fixed top-0 left-0 w-full h-14 flex items-center justify-between px-10 border-b border-zinc-900 bg-black/90 backdrop-blur-md z-[100]">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
              <Database className="text-black w-3.5 h-3.5 fill-current" />
            </div>
            <span className="font-bold text-[10px] uppercase tracking-[0.3em] pt-0.5">NexusData Engine</span>
          </div>
        </div>

        <div className="flex items-center gap-8">
           <div className="hidden lg:flex items-center gap-8 mr-6 border-r border-zinc-800 pr-8 h-6">
              {["Inventory", "Neural", "Reports"].map((item) => (
                <Link key={item} href={`/${item.toLowerCase() === 'inventory' ? 'datasets' : item.toLowerCase()}`} className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600 hover:text-white transition-colors">{item}</Link>
              ))}
           </div>
          <Link href="/datasets">
            <Button className="bg-white text-black hover:bg-zinc-200 font-black h-8 px-4 rounded-sm text-[9px] uppercase tracking-[0.2em] transition-all">
              Launch Console
            </Button>
          </Link>
        </div>
      </nav>

      {/* Massive Technical Hero */}
      <div className="min-h-screen flex flex-col justify-center border-b border-zinc-900">
        <div className="max-w-[1800px] mx-auto w-full px-10 grid grid-cols-1 lg:grid-cols-12 gap-24 items-center">
          
          <div className="lg:col-span-5 space-y-16">
            <div className="space-y-8">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-zinc-900/50 border border-zinc-800"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-zinc-500">Core Node #01 • GROQ LPU Inference</span>
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-6xl xl:text-8xl font-black tracking-tighter leading-[0.85] uppercase italic"
              >
                Data <br /> <span className="text-zinc-500">Synthesis.</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.8 }}
                className="text-lg text-zinc-500 font-medium leading-relaxed max-w-lg"
              >
                Engineered for high-fidelity data cleaning and strategic insight extraction. The enterprise-standard neural pipeline.
              </motion.p>
            </div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-2 gap-12 border-t border-zinc-900 pt-12"
            >
              <div className="space-y-2">
                <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Architecture</p>
                <p className="text-sm font-bold text-white uppercase">GROQ LPU™</p>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Protocol</p>
                <p className="text-sm font-bold text-white uppercase">E2E Encryption</p>
              </div>
            </motion.div>
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="lg:col-span-7"
          >
            <div className="relative p-[1px] rounded-sm bg-gradient-to-br from-zinc-700 to-black shadow-2xl overflow-hidden group">
               <div className="bg-black p-12 sm:p-20 relative">
                  <div className="flex items-center justify-between mb-16 border-b border-zinc-900 pb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-sm border border-zinc-800 flex items-center justify-center bg-zinc-900">
                        <Terminal className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black uppercase tracking-tighter">Ingestion Node</h2>
                        <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em] mt-1">Awaiting Manifest Transmission</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                       <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Uptime</span>
                       <span className="text-xs font-bold text-emerald-500">99.99%</span>
                    </div>
                  </div>
                  <UploadSection />
               </div>
            </div>
            
            <div className="mt-8 flex items-center justify-center gap-4 text-zinc-700 opacity-50 group-hover:opacity-100 transition-opacity">
               <span className="text-[10px] font-black uppercase tracking-[0.5em]">Transmit Manifest via Drag & Drop</span>
               <ArrowRight className="w-4 h-4 animate-bounce-x" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Ribbon Stats */}
      <div className="bg-zinc-950 border-b border-zinc-900 py-12">
         <div className="max-w-[1800px] mx-auto px-10 flex flex-wrap justify-between gap-12">
            {[
              { label: "Neural Clusters", value: "4.8M", icon: Binary },
              { label: "Extraction gain", value: "+32%", icon: Activity },
              { label: "Processing Latency", value: "< 12ms", icon: Globe },
              { label: "Node Integrity", value: "99.9%", icon: Shield }
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-5">
                 <stat.icon className="w-6 h-6 text-zinc-800" />
                 <div>
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{stat.label}</p>
                    <p className="text-2xl font-black text-zinc-300">{stat.value}</p>
                 </div>
              </div>
            ))}
         </div>
      </div>

      {/* Local Registry (Wide & Open) */}
      <section className="py-32 px-10 max-w-[1800px] mx-auto">
        <div className="flex items-center justify-between mb-20 px-4">
          <div className="flex items-center gap-5">
            <LayoutDashboard className="w-8 h-8 text-zinc-800" />
            <div>
              <h3 className="text-3xl font-black uppercase tracking-tighter leading-none">Local Manifest History</h3>
              <p className="text-[11px] font-black text-zinc-600 uppercase tracking-[0.3em] mt-2">Historical telemetry logs</p>
            </div>
          </div>
          <Link href="/datasets" className="group flex items-center gap-4 text-zinc-500 hover:text-white transition-all">
            <span className="text-[11px] font-black uppercase tracking-[0.3em]">Access Full Inventory</span>
            <div className="w-8 h-8 rounded-full border border-zinc-800 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
              <ChevronRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
        
        <div className="border-t border-zinc-900 pt-12">
          <AnalysisHistory />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-20 px-10 bg-black">
        <div className="max-w-[1800px] mx-auto flex flex-col lg:flex-row justify-between items-center gap-16 opacity-30 grayscale hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-white fill-current" />
            <span className="font-black text-[11px] uppercase tracking-[0.4em] text-white">NexusData Neural Architecture</span>
          </div>
          
          <div className="flex gap-16">
            {["Security Protocol", "Inference API", "Privacy Manifest", "Legal Control"].map(item => (
              <span key={item} className="text-[10px] font-black text-zinc-600 hover:text-white uppercase tracking-widest cursor-pointer transition-colors">{item}</span>
            ))}
          </div>
          
          <p className="text-zinc-800 text-[10px] font-bold uppercase tracking-[0.5em]">© 2026 Nexus Synthesis Corp.</p>
        </div>
      </footer>
    </main>
  );
}
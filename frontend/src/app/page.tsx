"use client";
import { Hero } from "@/components/landing/Hero";
import { UploadSection } from "@/components/landing/UploadSection";
import { Features } from "@/components/landing/Features";
import { AnalysisHistory } from "@/components/landing/AnalysisHistory";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#060606] text-white selection:bg-blue-500/30 overflow-x-hidden">
      {/* Premium Navbar */}
      <nav className="w-full h-20 flex items-center justify-between px-6 sm:px-12 border-b border-white/[0.06] bg-[#060606]/80 backdrop-blur-2xl sticky top-0 z-50 transition-all">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <span className="font-black text-xl tracking-tighter uppercase">NexusData <span className="text-blue-500">AI</span></span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm font-bold text-neutral-400 hover:text-white transition-colors">Platform</Link>
          <Link href="#upload" className="text-sm font-bold text-neutral-400 hover:text-white transition-colors">Solutions</Link>
          <Link href="/datasets" className="text-sm font-bold text-neutral-400 hover:text-white transition-colors">Inventory</Link>
        </div>

        <Link href="/datasets">
          <Button className="bg-white text-black hover:bg-neutral-200 font-bold h-10 px-6 rounded-xl shadow-xl active:scale-95 transition-all">
            Dashboard <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </nav>

      {/* Decorative background elements */}
      <div className="relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none opacity-50" />
        
        <Hero />
        
        <div id="upload" className="relative z-10 py-20 px-6 max-w-5xl mx-auto">
           <div className="bg-[#0f0f0f] border border-neutral-800/60 rounded-[3rem] p-1 shadow-2xl overflow-hidden relative group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="p-8 sm:p-12 lg:p-16">
                <UploadSection />
              </div>
           </div>
        </div>

        <div id="features" className="py-24">
          <Features />
        </div>

        <div className="pb-32 px-6 sm:px-12 max-w-[1400px] mx-auto">
          <AnalysisHistory />
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-12 px-6 border-t border-white/[0.06] bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3 opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-pointer">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <Sparkles className="text-white w-4 h-4" />
            </div>
            <span className="font-bold text-lg tracking-tighter uppercase">NexusData AI</span>
          </div>
          <p className="text-neutral-500 text-[13px] font-medium">© 2026 Neural Synthesis Engine. Corporate-Grade Intelligence.</p>
          <div className="flex gap-6">
            <span className="text-neutral-500 hover:text-white text-xs font-bold transition-colors cursor-pointer">Security</span>
            <span className="text-neutral-500 hover:text-white text-xs font-bold transition-colors cursor-pointer">API</span>
            <span className="text-neutral-500 hover:text-white text-xs font-bold transition-colors cursor-pointer">Legal</span>
          </div>
        </div>
      </footer>
    </main>
  );
}

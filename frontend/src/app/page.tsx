"use client";

import { Hero } from "@/components/landing/Hero";
import { UploadSection } from "@/components/landing/UploadSection";
import { Features } from "@/components/landing/Features";
import { AnalysisHistory } from "@/components/landing/AnalysisHistory";
import { Zap } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-indigo-500/30 font-sans antialiased overflow-x-hidden">
      {/* Visual background enhancements */}
      <div className="absolute inset-0 bg-neutral-950 opacity-20 pointer-events-none mix-blend-overlay"></div>
      <div className="absolute top-0 left-0 w-full h-[100vh] bg-gradient-to-b from-indigo-500/10 via-transparent to-transparent pointer-events-none"></div>
      
      {/* Navigation */}
      <nav className="w-full h-20 flex items-center justify-between px-10 border-b border-white/5 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
          <Zap className="text-indigo-500" />
          <span>NexusData<span className="text-white/50"> AI</span></span>
        </div>
      </nav>

      {/* Landing Content */}
      <Hero />
      <UploadSection />
      <Features />
      <AnalysisHistory />

      {/* Footer */}
      <footer className="w-full py-20 border-t border-white/5 text-center">
        <div className="flex items-center justify-center gap-2 font-bold text-lg mb-4 opacity-50">
          <Zap className="text-indigo-500 w-4 h-4" />
          <span>NexusData AI</span>
        </div>
        <p className="text-neutral-600 text-sm">
          &copy; {new Date().getFullYear()} NexusData AI • Built for high performance analysis.
        </p>
      </footer>
    </main>
  );
}

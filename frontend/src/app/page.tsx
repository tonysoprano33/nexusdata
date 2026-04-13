"use client";
import { Hero } from "@/components/landing/Hero";
import { UploadSection } from "@/components/landing/UploadSection";
import { Features } from "@/components/landing/Features";
import { AnalysisHistory } from "@/components/landing/AnalysisHistory";
import { Zap } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-indigo-500/30">
      <nav className="w-full h-20 flex items-center justify-between px-10 border-b border-white/5 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-xl">
          <Zap className="text-indigo-500" /> NexusData AI
        </div>
      </nav>
      <Hero />
      <UploadSection />
      <Features />
      <AnalysisHistory />
    </main>
  );
}

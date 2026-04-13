"use client";
import { useState } from "react";
import { EnterpriseSidebar } from "@/components/layout/EnterpriseSidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { Brain, Sparkles, TrendingUp, Zap, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function IntelligencePage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <EnterpriseSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <TopNavbar sidebarCollapsed={sidebarCollapsed} datasetName="AI Intelligence Hub" datasetStatus="active" />

      <main className="pt-24 transition-all duration-300" style={{ marginLeft: sidebarCollapsed ? 80 : 260 }}>
        <div className="p-8 max-w-[1200px] mx-auto">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <Brain className="text-violet-500 w-8 h-8" />
                Intelligence Hub
              </h1>
              <p className="text-neutral-500 mt-1">Cross-dataset analysis and global business insights powered by Gemini.</p>
            </div>
            <Badge className="bg-violet-500/10 text-violet-400 border-violet-500/20 px-3 py-1">AI ENGINE ACTIVE</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-violet-600/10 to-transparent border-violet-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-violet-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Global Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-neutral-500">Actionable patterns found today</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-600/10 to-transparent border-blue-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-300 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Efficiency Gain
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+24%</div>
                <p className="text-xs text-neutral-500">Based on data optimizations</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-emerald-600/10 to-transparent border-emerald-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-emerald-300 flex items-center gap-2">
                  <Zap className="w-4 h-4" /> Processing Power
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Turbo</div>
                <p className="text-xs text-neutral-500">Using Gemini Flash 1.5</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-neutral-900/40 border-white/10 p-8 flex flex-col items-center text-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-2">
                <MessageCircle className="w-8 h-8 text-violet-400" />
              </div>
              <h3 className="text-xl font-bold">Global Chat</h3>
              <p className="text-neutral-500 text-sm max-w-xs">Ask questions about all your datasets at once using our unified AI context.</p>
              <Button className="bg-violet-600 hover:bg-violet-500 w-full max-w-[200px]">Launch Global Chat</Button>
            </Card>

            <Card className="bg-neutral-900/40 border-white/10 p-8 flex flex-col items-center text-center justify-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-2">
                <Sparkles className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold">Auto-Discovery</h3>
              <p className="text-neutral-500 text-sm max-w-xs">Let the AI scan for anomalies and opportunities in the background.</p>
              <Button variant="outline" className="border-white/10 hover:bg-white/5 w-full max-w-[200px]">Run Discovery Scan</Button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

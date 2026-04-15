"use client";
import { useState, useEffect } from "react";
import { EnterpriseSidebar } from "@/components/layout/EnterpriseSidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { Settings, Key, User, CreditCard, Shield, Save, Check, Globe, Bell, Smartphone, Trash2, Terminal, Fingerprint, Activity } from "lucide-react";
import { Card, CardInsight } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function SettingsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setSidebarCollapsed(mobile);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white/10">
      {!isMobile && (
        <EnterpriseSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      )}

      <TopNavbar sidebarCollapsed={sidebarCollapsed} datasetName="Workspace Console" />

      <main className={cn(
        "pt-20 min-h-screen transition-all duration-300",
        isMobile ? "ml-0" : sidebarCollapsed ? "ml-16" : "ml-60"
      )}>
        <div className="px-10 py-10 max-w-6xl mx-auto w-full">

          <div className="mb-16 space-y-4">
            <div className="flex items-center gap-3">
              <Terminal className="w-5 h-5 text-zinc-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Infrastructure Configuration</span>
            </div>
            <h1 className="text-5xl font-black tracking-tighter uppercase">System Preferences.</h1>
          </div>

          <Tabs defaultValue="general" className="space-y-12">
            <TabsList className="bg-black border border-zinc-900 p-1 rounded-sm w-full h-auto flex gap-1">
              {["general", "keys", "billing"].map((tab) => (
                <TabsTrigger 
                  key={tab} 
                  value={tab} 
                  className="flex-1 rounded-sm data-[state=active]:bg-white data-[state=active]:text-black text-zinc-600 font-black text-[10px] uppercase tracking-widest py-3 transition-all"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="general" className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-8 space-y-12">
                  <div className="space-y-8">
                    <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
                       <User className="w-4 h-4 text-zinc-500" />
                       <h3 className="text-sm font-black uppercase tracking-[0.2em]">Identity Management</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">Full Name</label>
                        <Input className="bg-zinc-950 border-zinc-900 h-12 rounded-sm text-sm text-white font-medium focus:border-zinc-700 outline-none ring-0 px-4" defaultValue="John Doe" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">Neural ID / Email</label>
                        <Input className="bg-zinc-950 border-zinc-900 h-12 rounded-sm text-sm text-white font-medium focus:border-zinc-700 outline-none ring-0 px-4" defaultValue="john@nexusdata.ai" />   
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8 pt-12 border-t border-zinc-900">
                    <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
                       <Bell className="w-4 h-4 text-zinc-500" />
                       <h3 className="text-sm font-black uppercase tracking-[0.2em]">Telemetry Alerts</h3>
                    </div>
                    <div className="space-y-4">
                      {[
                        { title: "Node Status Broadcast", desc: "Real-time feedback on neural synthesis completion." },
                        { title: "Security Protocols", desc: "Receive alerts on anomalous access attempts." }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-6 rounded-sm border border-zinc-900 bg-black">
                           <div className="space-y-1">
                              <p className="text-sm font-bold text-white uppercase tracking-tighter">{item.title}</p>
                              <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{item.desc}</p>
                           </div>
                           <div className="w-10 h-5 bg-zinc-900 rounded-full relative cursor-pointer border border-zinc-800">
                              <div className="absolute top-1 left-1 w-2.5 h-2.5 bg-zinc-500 rounded-full" />
                           </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                   <div className="p-8 border border-zinc-900 bg-zinc-950/30 text-center space-y-6">
                      <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-3xl font-black text-black mx-auto">
                        JD
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-lg font-black uppercase tracking-tighter">John Doe</h3>
                        <p className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Administrator Node</p>
                      </div>
                      <Button variant="outline" className="w-full border-zinc-800 text-white font-black text-[10px] uppercase tracking-widest h-10 rounded-sm">Update Image</Button>
                   </div>

                   <div className="p-8 border border-red-900/20 bg-red-500/5 space-y-4">     
                      <h4 className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] flex items-center gap-2">
                        <Trash2 className="w-4 h-4" /> Termination Zone
                      </h4>
                      <p className="text-[11px] text-red-900/60 font-medium leading-relaxed">Permanently delete account manifest and neural analysis history.</p>
                      <Button className="w-full bg-red-500 text-white font-black text-[10px] uppercase tracking-widest h-10 rounded-sm hover:bg-red-400">Terminate Account</Button>
                   </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="keys" className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
               <div className="p-12 border border-zinc-900 bg-black space-y-12">
                  <div className="space-y-4 max-w-2xl">
                    <h3 className="text-2xl font-black uppercase tracking-tighter">API Infrastructure</h3>
                    <p className="text-zinc-500 text-sm font-medium leading-relaxed">Connect your proprietary neural nodes to the synthesis engine. Ensure all keys are stored in a secure hardware enclave.</p>
                  </div>
                  
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em]">Gemini Pro / Secure Ingress</label>
                      <div className="flex gap-3">
                        <Input type="password" title="API Key" className="flex-1 bg-zinc-950 border-zinc-900 h-14 rounded-sm text-white font-mono text-sm focus:border-zinc-700 outline-none ring-0 px-4" placeholder="••••••••••••••••" />
                        <Button className="bg-white text-black font-black text-[10px] uppercase tracking-widest h-14 px-8 rounded-sm">Sync Key</Button>
                      </div>
                    </div>
                  </div>

                  <CardInsight label="Security Protocol" className="mt-12 bg-zinc-950/50">
                    <div className="flex items-center gap-3">
                       <Shield className="w-4 h-4 text-emerald-500" />
                       <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">AES-256 Bit Encryption Active on all data ingress points.</span>
                    </div>
                  </CardInsight>
               </div>
            </TabsContent>

            <TabsContent value="billing" className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="p-20 border border-zinc-900 bg-black text-center space-y-10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-zinc-800/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="w-20 h-20 rounded-sm border border-zinc-800 bg-black flex items-center justify-center mx-auto shadow-2xl">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-zinc-900 border border-zinc-800">
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em]">Active Subscription Manifest</span>
                  </div>
                  <h3 className="text-4xl font-black uppercase tracking-tighter">Nexus Pro Tier.</h3>
                  <p className="text-zinc-500 max-w-sm mx-auto font-medium text-sm uppercase tracking-widest leading-loose">Unlimited Neural Clusters. High-Resolution Analysis. 4K Export Protocol.</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button className="bg-white text-black font-black h-12 px-10 rounded-sm text-[10px] uppercase tracking-widest">Manage Billing</Button>
                  <Button variant="outline" className="border-zinc-800 text-white font-black h-12 px-10 rounded-sm text-[10px] uppercase tracking-widest">Archive History</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-32 pt-16 border-t border-zinc-900 grid grid-cols-1 md:grid-cols-3 gap-12 text-zinc-700">
            <div className="space-y-4">
               <Fingerprint className="w-6 h-6" />
               <h4 className="text-[10px] font-black uppercase tracking-[0.3em]">Hardware ID</h4>
               <p className="text-[11px] font-medium leading-relaxed uppercase">Assigned to Local Node #01. Session integrity verified via cryptographical signature.</p>
            </div>
            <div className="space-y-4">
               <Activity className="w-6 h-6" />
               <h4 className="text-[10px] font-black uppercase tracking-[0.3em]">Network Status</h4>
               <p className="text-[11px] font-medium leading-relaxed uppercase">Direct connection to Neural Backbone established. Latency &lt; 1ms via ultra-low-orbit mesh.</p>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

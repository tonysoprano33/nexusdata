"use client";
import { useState, useEffect } from "react";
import { EnterpriseSidebar } from "@/components/layout/EnterpriseSidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { Settings, Key, User, CreditCard, Shield, Save, Check, Globe, Bell, Smartphone, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setSidebarCollapsed(true);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#060606] text-white selection:bg-neutral-500/30">
      <div className={cn("transition-all duration-300", isMobile ? "hidden" : "block")}>
        <EnterpriseSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      </div>

      <TopNavbar sidebarCollapsed={sidebarCollapsed} datasetName="Workspace Settings" datasetStatus="completed" />

      <main 
        className={cn(
          "pt-24 min-h-screen transition-all duration-300 ease-in-out",
          isMobile ? "ml-0" : sidebarCollapsed ? "ml-20" : "ml-64"
        )}
      >  
        <div className="p-4 sm:p-8 lg:p-10 max-w-[1200px] mx-auto w-full">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <div className="space-y-2">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-neutral-800 border border-neutral-700/50 flex items-center justify-center shadow-lg">
                  <Settings className="text-neutral-400 w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-4xl font-black tracking-tight text-white">
                    Preferences
                  </h1>
                  <p className="text-neutral-500 font-medium">Manage your professional workspace, security keys and team billing.</p>
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="general" className="space-y-8">
            <div className="sticky top-20 z-20 py-2 bg-[#060606]/80 backdrop-blur-xl">
              <TabsList className="bg-neutral-900/50 border border-neutral-800/60 p-1.5 rounded-2xl w-full sm:w-auto h-auto grid grid-cols-3 sm:flex">
                <TabsTrigger value="general" className="rounded-xl data-[state=active]:bg-neutral-800 data-[state=active]:text-white text-neutral-500 font-bold gap-2 py-2.5 px-6 transition-all">
                  <User className="w-4 h-4" /> <span className="hidden sm:inline">Profile</span>
                </TabsTrigger>
                <TabsTrigger value="keys" className="rounded-xl data-[state=active]:bg-neutral-800 data-[state=active]:text-white text-neutral-500 font-bold gap-2 py-2.5 px-6 transition-all">
                  <Key className="w-4 h-4" /> <span className="hidden sm:inline">API Keys</span>
                </TabsTrigger>
                <TabsTrigger value="billing" className="rounded-xl data-[state=active]:bg-neutral-800 data-[state=active]:text-white text-neutral-500 font-bold gap-2 py-2.5 px-6 transition-all">
                  <CreditCard className="w-4 h-4" /> <span className="hidden sm:inline">Billing</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="general" className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-6">
                  <Card className="bg-[#0f0f0f] border-neutral-800/60 rounded-[2rem] overflow-hidden shadow-xl">
                    <CardHeader className="p-8 pb-4">
                      <CardTitle className="text-2xl font-black text-white tracking-tight">Personal Identity</CardTitle>
                      <CardDescription className="text-[15px] font-medium text-neutral-500">How you appear to your team across the platform.</CardDescription>       
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <label className="text-[11px] font-black text-neutral-500 uppercase tracking-[0.2em] ml-1">Full Name</label>       
                          <Input className="bg-neutral-900 border-neutral-800/50 h-12 rounded-xl text-white font-medium focus:ring-2 focus:ring-white/10 border-none transition-all px-4" defaultValue="John Doe" />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[11px] font-black text-neutral-500 uppercase tracking-[0.2em] ml-1">Work Email</label>   
                          <Input className="bg-neutral-900 border-neutral-800/50 h-12 rounded-xl text-white font-medium focus:ring-2 focus:ring-white/10 border-none transition-all px-4" defaultValue="john@nexusdata.ai" />
                        </div>
                      </div>
                      
                      <div className="pt-4 flex justify-end">
                        <Button 
                          onClick={handleSave} 
                          className={cn(
                            "min-w-[160px] font-bold h-12 rounded-2xl transition-all active:scale-95 shadow-lg",
                            saved ? "bg-emerald-600 text-white" : "bg-white text-black hover:bg-neutral-200"
                          )}
                        >
                          {saved ? <Check className="w-5 h-5 mr-2 stroke-[3]" /> : <Save className="w-5 h-5 mr-2" />}
                          {saved ? "Success" : "Apply Changes"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-[#0f0f0f] border-neutral-800/60 rounded-[2rem] overflow-hidden shadow-xl">
                    <CardHeader className="p-8 pb-0">
                      <CardTitle className="text-xl font-bold text-white tracking-tight">Notifications</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-6 space-y-4">
                      {[
                        { icon: Globe, title: "Browser Alerts", desc: "Get real-time feedback on analysis completion.", enabled: true },
                        { icon: Smartphone, title: "Mobile Push", desc: "Sync analysis reports to your mobile device.", enabled: false }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center">
                                 <item.icon className="w-5 h-5 text-neutral-400" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-white">{item.title}</p>
                                <p className="text-xs text-neutral-500 font-medium">{item.desc}</p>
                              </div>
                           </div>
                           <div className={cn("w-12 h-6 rounded-full relative cursor-pointer transition-colors", item.enabled ? "bg-blue-600" : "bg-neutral-800")}>
                              <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full transition-all", item.enabled ? "right-1" : "left-1")} />
                           </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                   <Card className="bg-[#0f0f0f] border-neutral-800/60 rounded-[2rem] p-8 space-y-6 shadow-xl">
                      <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-2xl font-black text-white mx-auto shadow-2xl">
                        JD
                      </div>
                      <div className="text-center space-y-1">
                        <h3 className="text-xl font-black text-white tracking-tight">John Doe</h3>
                        <p className="text-sm text-neutral-500 font-bold uppercase tracking-widest">Administrator</p>
                      </div>
                      <Button variant="outline" className="w-full border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800 text-white font-bold h-11 rounded-xl transition-all">
                        Update Avatar
                      </Button>
                   </Card>

                   <Card className="bg-red-500/5 border-red-500/10 rounded-[2rem] p-8 space-y-4 shadow-xl">
                      <h4 className="text-sm font-bold text-red-400 uppercase tracking-widest flex items-center gap-2">
                        <Trash2 className="w-4 h-4" /> Danger Zone
                      </h4>
                      <p className="text-xs text-red-400/60 font-medium leading-relaxed">Permanently delete your account and all associated dataset analysis history.</p>
                      <Button className="w-full bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/20 font-bold h-11 rounded-xl transition-all">
                        Delete Account
                      </Button>
                   </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="keys">
              <Card className="bg-[#0f0f0f] border-neutral-800/60 rounded-[2rem] overflow-hidden shadow-xl">
                <CardHeader className="p-8 pb-4">
                  <CardTitle className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                    <Brain className="w-7 h-7 text-blue-400" />
                    AI Neural Configuration
                  </CardTitle>
                  <CardDescription className="text-[15px] font-medium text-neutral-500">Provide your proprietary API keys to power the high-fidelity synthesis engine.</CardDescription>    
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="space-y-4">
                    <label className="text-[11px] font-black text-neutral-500 uppercase tracking-[0.2em] ml-1">Gemini Pro API Key</label>    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Input type="password" title="API Key" className="flex-1 bg-neutral-900 border-neutral-800/50 h-12 rounded-xl text-white font-mono focus:ring-2 focus:ring-blue-500/20 border-none transition-all px-4" placeholder="AIzaSy..." />
                      <Button className="bg-blue-600 hover:bg-blue-500 text-white font-bold h-12 px-8 rounded-xl shadow-lg active:scale-95 transition-all">Update Key</Button>    
                    </div>
                    <div className="flex items-center gap-2 ml-1">
                      <Shield className="w-3 h-3 text-emerald-500" />
                      <p className="text-[11px] text-neutral-500 font-medium uppercase tracking-wider">RSA-4096 Encryption Active</p>  
                    </div>
                  </div>

                  <div className="pt-8 border-t border-neutral-800/50">
                    <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-3xl bg-blue-500/5 border border-blue-500/10 group">
                      <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Shield className="w-7 h-7 text-blue-400" />
                      </div>
                      <div className="text-center sm:text-left">
                        <h4 className="text-base font-bold text-white mb-1">Corporate-Grade Privacy</h4>
                        <p className="text-sm text-neutral-400 font-medium leading-relaxed">NexusData ensures your keys and raw data never leave our secure enclave. All processing is transient and ephemeral.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing">
              <Card className="bg-[#0f0f0f] border-neutral-800/60 rounded-[3rem] p-12 text-center group shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
                <div className="w-24 h-24 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500 shadow-xl">
                  <CreditCard className="w-12 h-12 text-emerald-500 shadow-emerald-500/20" />
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Current Active Plan</Badge>
                <h3 className="text-4xl font-black text-white tracking-tight mb-2">Nexus Pro Tier</h3>
                <p className="text-neutral-500 mb-8 max-w-sm mx-auto font-medium text-lg">Unlimited Neural Analysis, Multi-Dataset synthesis and 4K Export capability.</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button className="bg-white text-black hover:bg-neutral-200 font-black h-12 px-10 rounded-2xl shadow-xl active:scale-95 transition-all">Manage Subscription</Button>
                  <Button variant="outline" className="border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800 text-white font-bold h-12 px-10 rounded-2xl transition-all">View Invoices</Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

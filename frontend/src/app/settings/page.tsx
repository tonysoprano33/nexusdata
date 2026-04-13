"use client";
import { useState } from "react";
import { EnterpriseSidebar } from "@/components/layout/EnterpriseSidebar";
import { TopNavbar } from "@/components/layout/TopNavbar";
import { Settings, Key, User, CreditCard, Shield, Save, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <EnterpriseSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      
      <TopNavbar sidebarCollapsed={sidebarCollapsed} datasetName="Settings" datasetStatus="active" />

      <main className="pt-24 transition-all duration-300" style={{ marginLeft: sidebarCollapsed ? 80 : 260 }}>
        <div className="p-8 max-w-[1000px] mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Settings className="text-neutral-400 w-8 h-8" />
              Settings
            </h1>
            <p className="text-neutral-500 mt-1">Configure your workspace, API keys, and account preferences.</p>
          </div>

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="bg-white/5 border border-white/10 p-1">
              <TabsTrigger value="general" className="data-[state=active]:bg-blue-600 gap-2">
                <User className="w-4 h-4" /> Profile
              </TabsTrigger>
              <TabsTrigger value="keys" className="data-[state=active]:bg-blue-600 gap-2">
                <Key className="w-4 h-4" /> API Keys
              </TabsTrigger>
              <TabsTrigger value="billing" className="data-[state=active]:bg-blue-600 gap-2">
                <CreditCard className="w-4 h-4" /> Billing
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <Card className="bg-neutral-900/40 border-white/10">
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Update your personal details and how others see you.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-neutral-400 uppercase">Full Name</label>
                      <Input className="bg-white/5 border-white/10" defaultValue="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-neutral-400 uppercase">Email Address</label>
                      <Input className="bg-white/5 border-white/10" defaultValue="john@example.com" />
                    </div>
                  </div>
                  <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-500 gap-2">
                    {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {saved ? "Saved" : "Save Changes"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="keys">
              <Card className="bg-neutral-900/40 border-white/10">
                <CardHeader>
                  <CardTitle>AI Configuration</CardTitle>
                  <CardDescription>Enter your Gemini API key to power the analysis engine.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-neutral-400 uppercase">Gemini API Key</label>
                    <div className="flex gap-2">
                      <Input type="password" title="API Key" className="bg-white/5 border-white/10" placeholder="AIzaSy..." />
                      <Button variant="outline" className="border-white/10 hover:bg-white/5">Update</Button>
                    </div>
                    <p className="text-[10px] text-neutral-500">Your key is encrypted and stored securely.</p>
                  </div>
                  
                  <div className="pt-4 border-t border-white/5">
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-500/5 border border-blue-500/10">
                      <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-300">Enterprise Security</h4>
                        <p className="text-xs text-blue-200/60 mt-1">We never share your API keys or data with third parties.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing">
              <Card className="bg-neutral-900/40 border-white/10 p-10 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold mb-2">Free Plan</h3>
                <p className="text-neutral-500 mb-6 max-w-xs mx-auto text-sm">You are currently using the free tier with 10 analyses per month.</p>
                <Button className="bg-white text-black hover:bg-neutral-200">Upgrade to Pro</Button>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

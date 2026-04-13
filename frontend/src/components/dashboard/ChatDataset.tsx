"use client";
import { useState } from "react";
import { MessageSquare, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export function ChatDataset({ datasetId }: { datasetId: string }) {
  const [messages, setMessages] = useState<Array<{id: string; type: 'user' | 'bot'; content: string}>>([]);     
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (question: string = input) => {
    if (!question.trim()) return;
    const userMsg = { id: Date.now().toString(), type: 'user' as const, content: question };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/datasets/${datasetId}/chat?question=${encodeURIComponent(question)}`);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), type: 'bot', content: data.answer }]);  
    } catch {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), type: 'bot', content: "Error processing your question. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-[#141416] border-white/[0.06] h-[500px] flex flex-col shadow-2xl">
      <CardHeader className="pb-3 border-b border-white/[0.06]">
        <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-400" />
          Ask the Data
          <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[10px] uppercase">AI</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="space-y-2">
              <p className="text-neutral-500 text-xs text-center mb-4">Ask questions about your data in natural language</p>
              {["What's the average value?", "Show me trends over time", "Any correlations found?"].map((q, i) => (
                <button key={i} onClick={() => sendMessage(q)} className="w-full text-left p-2 rounded bg-white/[0.04] hover:bg-white/[0.08] text-xs text-neutral-300 transition-colors border border-white/5">
                  {q}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>  
                  <div className={`max-w-[85%] p-3 rounded-xl text-xs ${msg.type === 'user' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-neutral-800 text-neutral-200 border border-white/5'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-neutral-800 p-3 rounded-xl">
                    <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
        <div className="p-4 border-t border-white/[0.06] bg-black/20">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask anything..."
              className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
            />
            <Button size="sm" onClick={() => sendMessage()} disabled={loading} className="bg-indigo-600 hover:bg-indigo-500 h-9 px-4">
              Send
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

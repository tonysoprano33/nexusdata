"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Loader2 } from "lucide-react";
import axios from "axios";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { buildApiUrl } from "@/lib/api";

export function ChatDataset({ datasetId }: { datasetId: string }) {
  const [messages, setMessages] = useState<Array<{ id: string; type: "user" | "bot"; content: string }>>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    "What are the main quality issues that were fixed?",
    "Which variables show the strongest relationships?",
    "What business action should I prioritize first?",
  ]);

  const sendMessage = async (question: string) => {
    if (!question.trim()) return;

    const userMsg = { id: Date.now().toString(), type: "user" as const, content: question };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await axios.post(
        buildApiUrl(`/api/datasets/${datasetId}/chat?question=${encodeURIComponent(question)}`)
      );
      setMessages((prev) => [
        ...prev,
        { id: (Date.now() + 1).toString(), type: "bot", content: data.answer },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: "bot",
          content: "No pude responder en este momento. Intenta reformular la pregunta o reintenta en unos segundos.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const { data } = await axios.get(buildApiUrl(`/api/datasets/${datasetId}/chat/questions`));
        if (Array.isArray(data?.questions) && data.questions.length > 0) {
          setSuggestions(data.questions);
        }
      } catch (error) {
        console.error("Failed to load suggestions:", error);
      }
    };

    loadSuggestions();
  }, [datasetId]);

  useEffect(() => {
    const handleQuickAction = (event: Event) => {
      const customEvent = event as CustomEvent<{ prompt?: string }>;
      if (customEvent.detail?.prompt) {
        sendMessage(customEvent.detail.prompt);
      }
    };

    window.addEventListener("quick-analysis", handleQuickAction as EventListener);
    return () => window.removeEventListener("quick-analysis", handleQuickAction as EventListener);
  }, [datasetId]);

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
              <p className="text-neutral-500 text-xs text-center mb-4">
                Ask questions about your data in natural language
              </p>
              {suggestions.slice(0, 4).map((question, index) => (
                <button
                  key={`${question}-${index}`}
                  onClick={() => sendMessage(question)}
                  className="w-full text-left p-2 rounded bg-white/[0.04] hover:bg-white/[0.08] text-xs text-neutral-300 transition-colors border border-white/5"
                >
                  {question}
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-xl text-xs ${
                      message.type === "user"
                        ? "bg-indigo-600 text-white shadow-lg"
                        : "bg-neutral-800 text-neutral-200 border border-white/5"
                    }`}
                  >
                    {message.content}
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
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && sendMessage(input)}
              placeholder="Ask anything..."
              className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
            />
            <Button
              size="sm"
              onClick={() => sendMessage(input)}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 h-9 px-4"
            >
              Send
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

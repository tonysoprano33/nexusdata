"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, MessageSquare, Sparkles, Bot, User } from "lucide-react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://nexusdata-api.onrender.com";

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface ChatDatasetProps {
  datasetId: string;
}

export default function ChatDataset({ datasetId }: ChatDatasetProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Cargar preguntas sugeridas al inicio
  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/datasets/${datasetId}/chat/questions`);
        setSuggestedQuestions(response.data.questions || []);
      } catch (error) {
        console.error("Error loading suggestions:", error);
      }
    };
    loadSuggestions();
  }, [datasetId]);

  // Scroll automático al final
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (question: string = input) => {
    if (!question.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: question,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/datasets/${datasetId}/chat?question=${encodeURIComponent(question)}`
      );

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.data.answer,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
      } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: "⚠️ Error al procesar tu pregunta. Intenta de nuevo.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="bg-neutral-900/50 border-white/10 h-[500px] flex flex-col">
      <CardHeader className="pb-3 border-b border-white/5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-indigo-400" />
            Pregúntale al Dataset
            <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              IA
            </Badge>
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <AnimatePresence>
            {messages.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <p className="text-neutral-500 text-sm text-center mb-4">
                  Haz preguntas sobre tus datos en lenguaje natural
                </p>
                
                {suggestedQuestions.map((q, i) => (
                  <motion.button
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => sendMessage(q)}
                    className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-neutral-300 transition-all border border-white/5 hover:border-white/10"
                  >
                    <Sparkles className="h-4 w-4 inline mr-2 text-indigo-400" />
                    {q}
                  </motion.button>
                ))}
              </motion.div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.type === 'user' 
                        ? 'bg-indigo-500/20 text-indigo-400' 
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {msg.type === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                      msg.type === 'user'
                        ? 'bg-indigo-500/20 text-indigo-100 border border-indigo-500/20'
                        : 'bg-neutral-800 text-neutral-200 border border-white/5'
                    }`}>
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-green-400" />
                    </div>
                    <div className="bg-neutral-800 border border-white/5 p-3 rounded-lg">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>

        <div className="p-4 border-t border-white/5">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu pregunta sobre los datos..."
              className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-neutral-500"
            />
            <Button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

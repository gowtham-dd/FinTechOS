"use client";
import React, { useState, useEffect, useRef } from "react";
import { X, Send, Sparkles, ShieldCheck, Zap, Trash2, Bot, User, Lock, Activity, ChevronRight } from "lucide-react";
import { FormattedText } from "@/components/common/FormattedText";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  cacheHit?: boolean;
  latencyMs?: number;
  redactionsCount?: number;
  guardrailStatus?: string;
}

export function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userActivity, setUserActivity] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch initial activity summary and set welcome message
  useEffect(() => {
    fetchActivitySummary();
    setMessages([
      {
        id: "welcome-1",
        role: "assistant",
        content: "### 👋 Hello! I am your FinTech Agent OS Personal AI Assistant.\n\nI have access to your recent strategy backtest activities and performance metrics. Ask me any questions about strategy building, overfitting audit statistics, or platform guidance!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, []);

  const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const apiBase = rawApiUrl.replace(/\/api\/v1\/?$/, "");


  const fetchActivitySummary = async () => {
    try {
      const res = await fetch(`${apiBase}/api/v1/assistant/activity`);
      if (res.ok) {
        const data = await res.json();
        setUserActivity(data.user_activity_summary || "");
      }
    } catch (e) {
      console.error("Failed to load user activity:", e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage("");
    setLoading(true);

    try {
      const res = await fetch(`${apiBase}/api/v1/assistant/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, session_id: "demo_session" })
      });

      if (res.ok) {
        const data = await res.json();
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          role: "assistant",
          content: data.response,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          cacheHit: data.cache_hit,
          latencyMs: data.latency_ms,
          redactionsCount: data.redactions_count,
          guardrailStatus: data.guardrail_status
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (e: any) {
      console.error("Assistant chat error:", e);
      const errBotMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: `⚠️ **Backend Connection Error**: Unable to reach FastAPI backend server at \`${apiBase}\`. Ensure your backend server is running (\`uv run uvicorn app.main:app --reload --port 8000\`).`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errBotMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await fetch(`${apiBase}/api/v1/assistant/history?session_id=demo_session`, { method: "DELETE" });
      setMessages([
        {
          id: "welcome-reset",
          role: "assistant",
          content: "🧹 **Chat Memory Cleared**. How can I assist you with your quantitative strategies today?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (e) {
      console.error(e);
    }
  };

  const presetQuestions = [
    "How do I run a Bollinger strategy on Gold?",
    "Explain my recent Sharpe ratio & DSR",
    "What is the 30% Atomic Holdout Vault?",
    "How does SimHash cache work?"
  ];

  return (
    <>
      {/* Floating Logo Action Button (No verbose words) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Assistant"
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-orange-500 text-white shadow-xl shadow-amber-600/30 border-2 border-white/60 flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 group"
        >
          <div className="relative flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-amber-100 group-hover:rotate-12 transition-transform duration-300" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
          </div>
        </button>
      )}

      {/* Claude Warm Theme Chat Modal Drawer */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[430px] max-w-[92vw] h-[620px] max-h-[85vh] bg-white border border-amber-200/90 rounded-2xl shadow-2xl shadow-amber-950/15 flex flex-col overflow-hidden text-[#1E1915] animate-in fade-in slide-in-from-bottom-5 duration-200">
          
          {/* Header (Warm Theme) */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-amber-50/80 via-white to-orange-50/80 border-b border-amber-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-600/20 border border-white/40">
                <Sparkles className="w-5 h-5 text-amber-100" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-[#1E1915] text-sm tracking-tight">FinTech Assistant</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold border border-amber-200">
                    Llama-3.3-70B
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-neutral-500 font-medium">
                  <span className="flex items-center gap-1 text-emerald-700">
                    <ShieldCheck className="w-3 h-3" /> PII Guard Active
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-amber-700">
                    <Zap className="w-3 h-3" /> SimHash Cache
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearHistory}
                title="Clear Chat Memory"
                className="p-1.5 hover:bg-amber-100/60 text-neutral-500 hover:text-amber-800 rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-amber-100/60 text-neutral-500 hover:text-neutral-900 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* User Activity Context Banner */}
          {userActivity && (
            <div className="px-3.5 py-1.5 bg-amber-50/90 border-b border-amber-200/70 text-[11px] text-amber-900 font-medium flex items-center justify-between">
              <span className="truncate flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <span className="truncate">User Activity Connected (SQLite DB)</span>
              </span>
              <span className="text-[10px] text-amber-700 font-mono bg-amber-100/80 px-1.5 py-0.5 rounded border border-amber-200">
                5-Turn Window
              </span>
            </div>
          )}

          {/* Messages Stream (Warm Cream Background) */}
          <div className="flex-1 p-4 bg-[#FAF6F0] overflow-y-auto space-y-3.5 scrollbar-thin scrollbar-thumb-amber-300/60">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-amber-100 border border-amber-300/70 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white font-medium rounded-br-none shadow-md"
                      : "bg-white border border-amber-200/80 text-[#1E1915] rounded-bl-none shadow-sm"
                  }`}
                >
                  <div className="font-sans">
                    <FormattedText content={msg.content} />
                  </div>

                  {/* Metadata Badges for Assistant Response */}
                  {msg.role === "assistant" && (msg.cacheHit !== undefined || msg.latencyMs) && (
                    <div className="mt-2 pt-1.5 border-t border-amber-100 flex items-center justify-between text-[10px] text-neutral-500">
                      <div className="flex items-center gap-1.5">
                        {msg.cacheHit ? (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-300/80 flex items-center gap-1 font-semibold">
                            <Zap className="w-2.5 h-2.5 text-emerald-600" /> SimHash Cache Hit
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                            LLM Response
                          </span>
                        )}
                        {msg.redactionsCount ? (
                          <span className="text-amber-700 flex items-center gap-0.5 font-medium">
                            <Lock className="w-2.5 h-2.5" /> PII Redacted
                          </span>
                        ) : null}
                      </div>

                      {msg.latencyMs && (
                        <span className="font-mono text-neutral-400">
                          {msg.latencyMs}ms
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-amber-700 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-7 h-7 rounded-full bg-amber-100 border border-amber-300 text-amber-700 flex items-center justify-center">
                  <Bot className="w-4 h-4 animate-bounce" />
                </div>
                <div className="bg-white border border-amber-200 rounded-2xl px-4 py-2 text-xs text-amber-900 flex items-center gap-2 shadow-sm">
                  <span className="animate-spin text-amber-600">⏳</span> Processing query with guardrails & PII anonymizer...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Preset Suggestion Chips */}
          <div className="px-3 py-2 bg-amber-50/60 border-t border-amber-200/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {presetQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                disabled={loading}
                className="whitespace-nowrap text-[10px] px-2.5 py-1 rounded-full bg-white hover:bg-amber-100/80 border border-amber-300/70 text-amber-900 font-semibold shadow-2xs transition flex items-center gap-1 flex-shrink-0"
              >
                <span>{q}</span>
                <ChevronRight className="w-2.5 h-2.5 text-amber-600" />
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-amber-200/80">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask assistant about strategies, metrics, or help..."
                className="flex-1 bg-[#FAF6F0] border border-amber-300/80 text-[#1E1915] rounded-xl px-3.5 py-2.5 text-xs placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !inputMessage.trim()}
                className="p-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-40 text-white rounded-xl shadow-md transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>
      )}
    </>
  );
}

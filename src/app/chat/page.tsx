"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, User, Loader2 } from "lucide-react";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { useLanguageStore } from "@/lib/language-store";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const suggestionsEn = [
  "What's the first step to buying a home?",
  "What's the difference between SONYMA and FHA?",
  "How much are closing costs in NYC?",
  "What should I check before signing a contract?",
  "How does DTI calculation work?",
  "What are red flags to watch for?",
];

const suggestionsKo = [
  "미국에서 처음 집 사려는데 뭐부터 해?",
  "SONYMA랑 FHA 차이가 뭐야?",
  "해외 부동산이 있으면 first-time buyer 자격이 안 돼?",
  "NYC 클로징 비용이 얼마나 돼?",
  "DTI가 뭐야? 어떻게 계산해?",
  "계약서 서명 전에 뭘 확인해야 해?",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { lang } = useLanguageStore();

  const suggestions = lang === "en" ? suggestionsEn : suggestionsKo;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function sendMessage(content: string) {
    if (!content.trim() || loading) return;

    const userMessage: Message = { role: "user", content: content.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      let userProfile = null;
      try {
        const stored = localStorage.getItem("firsthome-quiz");
        if (stored) userProfile = JSON.parse(stored);
      } catch {}

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          userProfile,
        }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message || (lang === "en" ? "Sorry, something went wrong." : "죄송합니다, 오류가 발생했습니다.") },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: lang === "en" ? "Connection error. Please try again." : "연결 오류입니다. 다시 시도해주세요." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div className="flex h-screen flex-col bg-black text-white">
      <Nav />

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto max-w-3xl">
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center pt-20"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                <Sparkles className="h-7 w-7 text-blue-400" />
              </div>
              <h2 className="mt-6 text-2xl font-bold">
                {lang === "en" ? "Ask me anything" : "무엇이든 물어보세요"}
              </h2>
              <p className="mt-2 text-sm text-zinc-500">
                {lang === "en"
                  ? "About buying your first home in the U.S."
                  : "미국에서 첫 주택 구매에 대해"}
              </p>

              <div className="mt-10 grid w-full gap-2 sm:grid-cols-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-left text-sm text-zinc-400 transition-all hover:border-white/15 hover:bg-white/[0.05] hover:text-white"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-6 flex gap-3 ${
                  msg.role === "user" ? "justify-end" : ""
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                    <Sparkles className="h-4 w-4 text-blue-400" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white"
                      : "bg-white/5 text-zinc-300"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
                {msg.role === "user" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
                    <User className="h-4 w-4 text-zinc-400" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-6 flex gap-3"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                <Sparkles className="h-4 w-4 text-blue-400" />
              </div>
              <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                <span className="text-sm text-zinc-500">
                  {lang === "en" ? "Thinking..." : "생각 중..."}
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-white/5 px-6 py-4">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-end gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 transition-colors focus-within:border-blue-500/30">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={lang === "en" ? "Ask about buying your first home..." : "첫 주택 구매에 대해 질문하세요..."}
              rows={1}
              className="flex-1 resize-none bg-transparent text-sm text-white placeholder-zinc-600 outline-none"
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 text-white transition-all hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-30"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-center text-xs text-zinc-700">
            {lang === "en"
              ? "AI can make mistakes. Consult professionals for legal and financial advice."
              : "AI는 실수할 수 있습니다. 법률 및 재정 조언은 전문가와 상담하세요."}
          </p>
        </div>
      </div>
    </div>
  );
}

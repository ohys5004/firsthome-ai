"use client";

import Link from "next/link";
import { Globe, Home } from "lucide-react";
import { useLanguageStore } from "@/lib/language-store";

export function Nav({ variant = "default" }: { variant?: "default" | "landing" }) {
  const { lang, toggleLang } = useLanguageStore();

  if (variant === "landing") {
    return (
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            FirstHome<span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">AI</span>
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/quiz" className="text-sm text-zinc-400 transition hover:text-white">
              {lang === "en" ? "Get Started" : "시작하기"}
            </Link>
            <Link href="/chat" className="text-sm text-zinc-400 transition hover:text-white">
              {lang === "en" ? "AI Chat" : "AI 채팅"}
            </Link>
            <Link href="/calculator" className="text-sm text-zinc-400 transition hover:text-white">
              {lang === "en" ? "Calculator" : "계산기"}
            </Link>
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-zinc-400 transition hover:border-white/20 hover:text-white"
            >
              <Globe className="h-3.5 w-3.5" />
              {lang === "en" ? "한국어" : "EN"}
            </button>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <div className="border-b border-white/5 px-6 py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-zinc-400 transition hover:text-white">
          <Home className="h-4 w-4" />
          <span className="text-sm font-medium">
            FirstHome<span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">AI</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/chat" className="text-xs text-zinc-500 hover:text-white transition">
            {lang === "en" ? "Chat" : "채팅"}
          </Link>
          <Link href="/calculator" className="text-xs text-zinc-500 hover:text-white transition">
            {lang === "en" ? "Calculator" : "계산기"}
          </Link>
          <Link href="/dashboard" className="text-xs text-zinc-500 hover:text-white transition">
            {lang === "en" ? "Dashboard" : "대시보드"}
          </Link>
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-xs text-zinc-500 transition hover:border-white/20 hover:text-white"
          >
            <Globe className="h-3 w-3" />
            {lang === "en" ? "한국어" : "EN"}
          </button>
        </div>
      </div>
    </div>
  );
}

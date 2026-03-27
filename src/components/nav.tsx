"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Home } from "lucide-react";
import { useLanguageStore } from "@/lib/language-store";

export function Nav({ variant = "default" }: { variant?: "default" | "landing" }) {
  const { lang, toggleLang } = useLanguageStore();
  const pathname = usePathname();

  const links = [
    { href: "/search", en: "Search", ko: "매물 검색" },
    { href: "/quiz", en: "Get Started", ko: "시작하기" },
    { href: "/chat", en: "AI Chat", ko: "AI 채팅" },
    { href: "/calculator", en: "Calculator", ko: "계산기" },
    { href: "/dashboard", en: "Dashboard", ko: "대시보드" },
  ];

  if (variant === "landing") {
    return (
      <nav className="fixed top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900">
            FirstHome
            <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
              AI
            </span>
          </Link>
          <div className="flex items-center gap-5">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm transition-colors duration-150 ${
                  pathname === link.href
                    ? "font-medium text-blue-600"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {lang === "en" ? link.en : link.ko}
              </Link>
            ))}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 transition-all duration-150 hover:border-gray-300 hover:text-gray-900 hover:shadow-sm"
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
    <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900">
          FirstHome
          <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
            AI
          </span>
        </Link>
        <div className="flex items-center gap-5">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors duration-150 ${
                pathname === link.href
                  ? "font-medium text-blue-600"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              {lang === "en" ? link.en : link.ko}
            </Link>
          ))}
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 transition-all duration-150 hover:border-gray-300 hover:text-gray-900 hover:shadow-sm"
          >
            <Globe className="h-3.5 w-3.5" />
            {lang === "en" ? "한국어" : "EN"}
          </button>
        </div>
      </div>
    </nav>
  );
}

"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  FileText,
  Calculator,
  AlertTriangle,
  MessageSquare,
  Map,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { useLanguageStore } from "@/lib/language-store";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: "easeOut" as const },
  }),
};

const features = [
  {
    icon: Map,
    title: "Step-by-Step Journey",
    titleKo: "단계별 가이드",
    desc: "12-step guide from pre-approval to closing, built from a real buyer's journey.",
    descKo: "사전 승인부터 클로징까지 12단계 가이드 — 실제 매수 경험 기반.",
    gradient: "from-blue-500 to-cyan-400",
  },
  {
    icon: FileText,
    title: "Document Analyzer",
    titleKo: "문서 분석",
    desc: "Upload contracts and disclosures — AI highlights risks and creates checklists.",
    descKo: "계약서와 공시자료를 업로드하면 AI가 위험 요소를 강조하고 체크리스트를 생성합니다.",
    gradient: "from-violet-500 to-purple-400",
  },
  {
    icon: Calculator,
    title: "Mortgage Calculator",
    titleKo: "모기지 계산기",
    desc: "DTI calculation, program matching (SONYMA, FHA, Conventional), and cost simulation.",
    descKo: "DTI 계산, 프로그램 매칭 (SONYMA, FHA, Conventional), 비용 시뮬레이션.",
    gradient: "from-emerald-500 to-teal-400",
  },
  {
    icon: AlertTriangle,
    title: "Red Flag Detector",
    titleKo: "위험 요소 감지",
    desc: "Real edge cases: overseas property issues, broker mistakes, escrow traps.",
    descKo: "실제 엣지 케이스: 해외 부동산 이슈, 브로커 실수, 에스크로 함정.",
    gradient: "from-orange-500 to-amber-400",
  },
  {
    icon: MessageSquare,
    title: "AI Chat Advisor",
    titleKo: "AI 채팅 어드바이저",
    desc: "Bilingual AI advisor trained on real home buying scenarios and market data.",
    descKo: "실제 매수 시나리오와 시장 데이터로 학습된 이중 언어 AI 어드바이저.",
    gradient: "from-pink-500 to-rose-400",
  },
];

const stats = [
  { value: "12", label: "Steps Mapped", labelKo: "매핑된 단계" },
  { value: "20+", label: "Meetings Analyzed", labelKo: "분석된 미팅" },
  { value: "7", label: "Edge Cases", labelKo: "엣지 케이스" },
  { value: "2", label: "Languages", labelKo: "지원 언어" },
];

export default function LandingPage() {
  const { lang } = useLanguageStore();

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      <Nav variant="landing" />

      {/* Hero */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-20">
        {/* Animated gradient orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ x: [0, 30, -20, 0], y: [0, -20, 30, 0], scale: [1, 1.1, 0.95, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <div className="h-[500px] w-[500px] rounded-full bg-blue-500/15 blur-[100px]" />
          </motion.div>
          <motion.div
            animate={{ x: [0, -40, 20, 0], y: [0, 30, -20, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/3 right-1/4"
          >
            <div className="h-[300px] w-[300px] rounded-full bg-purple-500/10 blur-[80px]" />
          </motion.div>
          <motion.div
            animate={{ x: [0, 20, -30, 0], y: [0, -30, 20, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-1/4 left-1/4"
          >
            <div className="h-[250px] w-[250px] rounded-full bg-cyan-500/10 blur-[80px]" />
          </motion.div>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          className="relative z-10 flex max-w-3xl flex-col items-center text-center"
        >
          <motion.div
            custom={0}
            variants={fadeUp}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-zinc-400"
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            {lang === "en"
              ? "Built from a real first-time buyer's journey"
              : "실제 첫 주택 구매자의 여정에서 만들어졌습니다"}
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeUp}
            className="text-5xl font-bold leading-[1.1] tracking-tight sm:text-7xl"
          >
            {lang === "en" ? (
              <>
                Your AI Guide to
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent">
                  Buying Your First Home
                </span>
              </>
            ) : (
              <>
                AI가 안내하는
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent">
                  첫 주택 구매 가이드
                </span>
              </>
            )}
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-400"
          >
            {lang === "en"
              ? "Navigate the entire home buying process with AI — from pre-approval to closing. Real data. Real edge cases. No guesswork."
              : "AI와 함께 주택 구매의 전 과정을 안내받으세요 — 사전 승인부터 클로징까지. 실제 데이터. 실제 엣지 케이스. 추측 없이."}
          </motion.p>

          <motion.div custom={3} variants={fadeUp} className="mt-10 flex gap-4">
            <Link
              href="/quiz"
              className="group relative flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:scale-[1.02]"
            >
              <span className="relative z-10">
                {lang === "en" ? "Start My Journey" : "여정 시작하기"}
              </span>
              <ArrowRight className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/chat"
              className="flex items-center gap-2 rounded-full border border-white/10 px-6 py-3.5 text-sm font-medium text-zinc-300 transition-all hover:border-white/25 hover:text-white hover:bg-white/5"
            >
              {lang === "en" ? "Ask AI a Question" : "AI에게 질문하기"}
            </Link>
          </motion.div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="relative z-10 mt-24 grid grid-cols-2 gap-8 sm:grid-cols-4"
        >
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-3xl font-bold text-transparent">
                {s.value}
              </div>
              <div className="mt-1 text-sm text-zinc-500">
                {lang === "en" ? s.label : s.labelKo}
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="border-t border-white/5 py-32">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {lang === "en" ? (
                <>
                  Everything you need,{" "}
                  <span className="bg-gradient-to-r from-zinc-400 to-zinc-600 bg-clip-text text-transparent">
                    nothing you don&apos;t
                  </span>
                </>
              ) : (
                <>
                  필요한 것만,{" "}
                  <span className="bg-gradient-to-r from-zinc-400 to-zinc-600 bg-clip-text text-transparent">
                    불필요한 것은 빼고
                  </span>
                </>
              )}
            </h2>
            <p className="mt-4 text-zinc-500">
              {lang === "en"
                ? "Five core features built from real first-time buying experience."
                : "실제 첫 주택 구매 경험에서 만들어진 5가지 핵심 기능."}
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group relative rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition-all duration-300 hover:border-white/15 hover:bg-white/[0.05]"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <div className="relative">
                  <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${f.gradient} bg-opacity-10`}>
                    <f.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold">
                    {lang === "en" ? f.title : f.titleKo}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                    {lang === "en" ? f.desc : f.descKo}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Preview */}
      <section className="border-t border-white/5 py-32">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {lang === "en" ? (
                <>
                  12 steps.{" "}
                  <span className="bg-gradient-to-r from-zinc-400 to-zinc-600 bg-clip-text text-transparent">
                    One clear path.
                  </span>
                </>
              ) : (
                <>
                  12단계.{" "}
                  <span className="bg-gradient-to-r from-zinc-400 to-zinc-600 bg-clip-text text-transparent">
                    하나의 명확한 경로.
                  </span>
                </>
              )}
            </h2>
            <p className="mt-4 text-zinc-500">
              {lang === "en"
                ? 'From "I want to buy a home" to getting your keys.'
                : '"집을 사고 싶다"에서 열쇠를 받는 그 순간까지.'}
            </p>
          </motion.div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { en: "Financial Readiness", ko: "재정 준비" },
              { en: "Pre-Approval", ko: "사전 승인" },
              { en: "Buyer's Agent", ko: "바이어 에이전트" },
              { en: "Search & Offer", ko: "매물 탐색 + 오퍼" },
              { en: "Contract + Attorney", ko: "계약서 + 변호사" },
              { en: "Inspection", ko: "인스펙션" },
              { en: "Mortgage Underwriting", ko: "모기지 심사" },
              { en: "Appraisal", ko: "감정평가" },
              { en: "Board Application", ko: "보드 어플리케이션" },
              { en: "Title + Insurance", ko: "타이틀 + 보험" },
              { en: "Closing", ko: "클로징" },
              { en: "Move In!", ko: "입주!" },
            ].map((step, i) => (
              <motion.div
                key={step.en}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="group flex items-center gap-4 rounded-xl border border-white/5 bg-white/[0.02] px-5 py-4 transition-all hover:border-white/15 hover:bg-white/[0.04]"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-sm font-bold text-blue-400 transition-colors group-hover:from-blue-500/30 group-hover:to-cyan-500/30">
                  {i + 1}
                </span>
                <span className="text-sm font-medium">
                  {lang === "en" ? step.en : step.ko}
                </span>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-12 text-center"
          >
            <Link
              href="/quiz"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:scale-[1.02]"
            >
              {lang === "en" ? "Start Your Journey" : "여정 시작하기"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-zinc-600">
          <p>
            {lang === "en"
              ? "FirstHome AI — Built from a real first-time buyer's journey in NYC."
              : "FirstHome AI — NYC에서의 실제 첫 주택 구매 여정을 바탕으로 만들어졌습니다."}
          </p>
          <p className="mt-2">
            {lang === "en"
              ? "No personal data is stored. All journey data is anonymized."
              : "개인 정보는 저장되지 않습니다. 모든 여정 데이터는 익명화됩니다."}
          </p>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  MapPin,
  Map,
  MessageSquare,
  Calculator,
  FileText,
  AlertTriangle,
  Search,
  Home,
  Building2,
  BedDouble,
} from "lucide-react";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { useLanguageStore } from "@/lib/language-store";

/* ─── Animation variants ─────────────────────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" as const },
  }),
};

/* ─── Data ────────────────────────────────────────────────────── */
const features = [
  {
    icon: MapPin,
    title: "Search Listings",
    titleKo: "매물 검색",
    desc: "Search NYC & NJ listings with smart filters — price, HOA, sqft, commute time, and more.",
    descKo: "가격, HOA, 면적, 출퇴근 시간 등 스마트 필터로 NYC·NJ 매물을 검색하세요.",
    color: "bg-blue-100 text-blue-600",
    href: "/search",
  },
  {
    icon: Map,
    title: "Step-by-Step Journey",
    titleKo: "단계별 가이드",
    desc: "12-step guide from pre-approval to closing, built from a real buyer's journey.",
    descKo: "사전 승인부터 클로징까지 12단계 가이드 — 실제 매수 경험 기반.",
    color: "bg-emerald-100 text-emerald-600",
    href: "/quiz",
  },
  {
    icon: MessageSquare,
    title: "AI Chat Advisor",
    titleKo: "AI 채팅 어드바이저",
    desc: "Bilingual AI advisor trained on real home buying scenarios and market data.",
    descKo: "실제 매수 시나리오와 시장 데이터로 학습된 이중 언어 AI 어드바이저.",
    color: "bg-violet-100 text-violet-600",
    href: "/chat",
  },
  {
    icon: Calculator,
    title: "Mortgage Calculator",
    titleKo: "모기지 계산기",
    desc: "DTI calculation, program matching (SONYMA, FHA, Conventional), and cost simulation.",
    descKo: "DTI 계산, 프로그램 매칭 (SONYMA, FHA, Conventional), 비용 시뮬레이션.",
    color: "bg-orange-100 text-orange-600",
    href: "/calculator",
  },
  {
    icon: FileText,
    title: "Document Analyzer",
    titleKo: "문서 분석",
    desc: "Upload contracts and disclosures — AI highlights risks and creates checklists.",
    descKo: "계약서와 공시자료를 업로드하면 AI가 위험 요소를 강조하고 체크리스트를 생성합니다.",
    color: "bg-pink-100 text-pink-600",
    href: "/dashboard",
  },
  {
    icon: AlertTriangle,
    title: "Red Flag Detector",
    titleKo: "위험 요소 감지",
    desc: "Real edge cases: overseas property issues, broker mistakes, escrow traps.",
    descKo: "실제 엣지 케이스: 해외 부동산 이슈, 브로커 실수, 에스크로 함정.",
    color: "bg-red-100 text-red-500",
    href: "/chat",
  },
];

const steps = [
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
];

const stats = [
  { value: "500+", label: "Listings Tracked", labelKo: "추적 중인 매물" },
  { value: "12", label: "Buying Steps Covered", labelKo: "구매 단계 커버" },
  { value: "NYC·NJ", label: "Markets Covered", labelKo: "커버 지역" },
  { value: "24/7", label: "AI Advisor Available", labelKo: "AI 상담 가능" },
];

const demoListings = [
  {
    address: "123 Bergen St, Brooklyn, NY",
    price: "$649,000",
    beds: 2,
    type: "Condo",
    hoa: "$420/mo",
    badge: "New",
    badgeColor: "bg-blue-100 text-blue-600",
    gradient: "from-blue-100 via-blue-50 to-indigo-100",
  },
  {
    address: "45 Grove Ave, Jersey City, NJ",
    price: "$528,000",
    beds: 3,
    type: "Townhouse",
    hoa: "No HOA",
    badge: "Popular",
    badgeColor: "bg-emerald-100 text-emerald-600",
    gradient: "from-emerald-100 via-green-50 to-teal-100",
  },
  {
    address: "88 Court St, Hoboken, NJ",
    price: "$715,000",
    beds: 2,
    type: "Co-op",
    hoa: "$610/mo",
    badge: "Price Drop",
    badgeColor: "bg-orange-100 text-orange-600",
    gradient: "from-orange-100 via-amber-50 to-yellow-100",
  },
];

const howItWorks = [
  {
    step: "1",
    title: "Take the Quiz",
    titleKo: "퀴즈 풀기",
    desc: "Answer a few questions about your budget, goals, and timeline.",
    descKo: "예산, 목표, 타임라인에 대한 몇 가지 질문에 답하세요.",
    color: "bg-blue-500",
  },
  {
    step: "2",
    title: "Get Your Plan",
    titleKo: "플랜 받기",
    desc: "Receive a personalized roadmap with the exact steps you need.",
    descKo: "필요한 단계가 담긴 맞춤형 로드맵을 받으세요.",
    color: "bg-emerald-500",
  },
  {
    step: "3",
    title: "Find Your Home",
    titleKo: "집 찾기",
    desc: "Search listings, run numbers, and close with confidence.",
    descKo: "매물을 검색하고, 숫자를 계산하고, 자신 있게 클로징하세요.",
    color: "bg-pink-500",
  },
];

/* ─── Component ───────────────────────────────────────────────── */
export default function LandingPage() {
  const { lang } = useLanguageStore();

  return (
    <div className="min-h-screen overflow-hidden bg-gray-50 font-sans text-gray-900">
      <Nav variant="landing" />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative flex min-h-screen flex-col items-center justify-center px-6 pt-20">
        {/* Pastel gradient orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ x: [0, 30, -20, 0], y: [0, -20, 30, 0], scale: [1, 1.08, 0.96, 1] }}
            transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
            className="absolute -top-10 left-1/2 -translate-x-1/2"
          >
            <div className="h-[500px] w-[500px] rounded-full bg-blue-100 opacity-70 blur-3xl" />
          </motion.div>
          <motion.div
            animate={{ x: [0, -40, 20, 0], y: [0, 30, -15, 0] }}
            transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/3 right-10"
          >
            <div className="h-[320px] w-[320px] rounded-full bg-pink-100 opacity-60 blur-3xl" />
          </motion.div>
          <motion.div
            animate={{ x: [0, 20, -30, 0], y: [0, -30, 20, 0] }}
            transition={{ duration: 19, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-1/4 left-1/4"
          >
            <div className="h-[280px] w-[280px] rounded-full bg-emerald-100 opacity-60 blur-3xl" />
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
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm text-gray-500 shadow-sm"
          >
            <Home className="h-3.5 w-3.5 text-blue-500" />
            {lang === "en"
              ? "Built from a real first-time buyer's journey"
              : "실제 첫 주택 구매자의 여정에서 만들어졌습니다"}
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeUp}
            className="text-5xl font-bold leading-[1.1] tracking-tight text-gray-900 sm:text-7xl"
          >
            {lang === "en" ? (
              <>
                Your Guide to
                <br />
                <span className="bg-gradient-to-r from-orange-400 via-pink-500 to-rose-400 bg-clip-text text-transparent">
                  Buying Your First Home
                </span>
              </>
            ) : (
              <>
                실제 구매자의 경험으로 —
                <br />
                <span className="bg-gradient-to-r from-orange-400 via-pink-500 to-rose-400 bg-clip-text text-transparent">
                  첫 주택 구매 가이드
                </span>
              </>
            )}
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            className="mt-6 max-w-xl text-lg leading-relaxed text-gray-500"
          >
            {lang === "en"
              ? "Every step, every edge case, every mistake to avoid — all from real first-time buyers. Pre-approval to closing."
              : "모든 단계, 모든 엣지 케이스, 피해야 할 실수까지 모두 함께하세요."}
          </motion.p>

          <motion.div custom={3} variants={fadeUp} className="mt-10 flex flex-wrap justify-center gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/quiz"
                className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition-shadow hover:shadow-blue-300"
              >
                {lang === "en" ? "Start My Journey" : "여정 시작하기"}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-6 py-3.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:shadow-md"
              >
                <Search className="h-4 w-4" />
                {lang === "en" ? "Search Listings" : "매물 검색"}
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.7 }}
          className="relative z-10 mt-24 grid grid-cols-2 gap-10 sm:grid-cols-4"
        >
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-bold text-blue-500">{s.value}</div>
              <div className="mt-1 text-sm text-gray-400">
                {lang === "en" ? s.label : s.labelKo}
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── Features Grid ────────────────────────────────────── */}
      <section className="border-t border-gray-100 bg-white py-28">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14 text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {lang === "en" ? (
                <>
                  Everything you need,{" "}
                  <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                    nothing you don&apos;t
                  </span>
                </>
              ) : (
                <>
                  필요한 것만,{" "}
                  <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                    불필요한 것은 빼고
                  </span>
                </>
              )}
            </h2>
            <p className="mt-4 text-gray-400">
              {lang === "en"
                ? "Six core features built from real first-time buying experience."
                : "실제 첫 주택 구매 경험에서 만들어진 6가지 핵심 기능."}
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
                whileHover={{ y: -4 }}
                className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-lg"
              >
                <div
                  className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${f.color}`}
                >
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-gray-900">
                  {lang === "en" ? f.title : f.titleKo}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  {lang === "en" ? f.desc : f.descKo}
                </p>
                <Link
                  href={f.href}
                  className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-500 transition-colors hover:text-blue-700"
                >
                  {lang === "en" ? "Try it" : "사용하기"}
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Search Preview ───────────────────────────────────── */}
      <section className="border-t border-gray-100 bg-gray-50 py-28">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {lang === "en" ? (
                <>
                  Find your{" "}
                  <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
                    perfect listing
                  </span>
                </>
              ) : (
                <>
                  완벽한{" "}
                  <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
                    매물 찾기
                  </span>
                </>
              )}
            </h2>
            <p className="mt-3 text-gray-400">
              {lang === "en"
                ? "Smart search across NYC and NJ — filtered for first-time buyers."
                : "첫 주택 구매자를 위한 스마트 NYC·NJ 매물 검색"}
            </p>
          </motion.div>

          {/* Mock search bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mx-auto mb-8 flex max-w-xl items-center gap-3 rounded-full border border-gray-200 bg-white px-5 py-3 shadow-sm"
          >
            <Search className="h-4 w-4 shrink-0 text-gray-400" />
            <span className="text-sm text-gray-400">
              {lang === "en" ? "Describe your ideal property conditions…" : "원하는 매물의 조건들을 모두 기재해보세요…"}
            </span>
          </motion.div>

          {/* Demo cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            {demoListings.map((listing, i) => (
              <motion.div
                key={listing.address}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-lg"
              >
                {/* Listing visual */}
                <div className={`mb-4 flex h-32 items-center justify-center rounded-xl bg-gradient-to-br ${listing.gradient}`}>
                  <Home className="h-10 w-10 text-gray-400/40" />
                </div>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold leading-snug text-gray-900">
                    {listing.address}
                  </p>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${listing.badgeColor}`}>
                    {listing.badge}
                  </span>
                </div>
                <p className="mt-1 text-lg font-bold text-blue-600">{listing.price}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <BedDouble className="h-3.5 w-3.5" />
                    {listing.beds} bed
                  </span>
                  <span className="flex items-center gap-1">
                    <Home className="h-3.5 w-3.5" />
                    {listing.type}
                  </span>
                  <span>{listing.hoa}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.35 }}
            className="mt-8 text-center"
          >
            <Link
              href="/search"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-500 transition-colors hover:text-blue-700"
            >
              {lang === "en" ? "Explore All Listings" : "모든 매물 보기"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────── */}
      <section className="border-t border-gray-100 bg-white py-28">
        <div className="mx-auto max-w-5xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14 text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {lang === "en" ? "How it works" : "어떻게 작동하나요?"}
            </h2>
            <p className="mt-3 text-gray-400">
              {lang === "en" ? "Three steps to your first home." : "세 단계로 첫 집을 찾으세요."}
            </p>
          </motion.div>

          <div className="grid gap-8 sm:grid-cols-3">
            {howItWorks.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                className="flex flex-col items-center text-center"
              >
                <div
                  className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${item.color} text-lg font-bold text-white shadow-md`}
                >
                  {item.step}
                </div>
                <h3 className="text-base font-semibold text-gray-900">
                  {lang === "en" ? item.title : item.titleKo}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  {lang === "en" ? item.desc : item.descKo}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Journey Preview ──────────────────────────────────── */}
      <section className="border-t border-gray-100 bg-gray-50 py-28">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-14 text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {lang === "en" ? (
                <>
                  12 steps.{" "}
                  <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                    One clear path.
                  </span>
                </>
              ) : (
                <>
                  집을 사기까지 필요한{" "}
                  <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                    모든 과정을 한번에
                  </span>
                </>
              )}
            </h2>
            <p className="mt-3 text-gray-400">
              {lang === "en"
                ? 'From "I want to buy a home" to getting your keys.'
                : '열쇠를 받는 그 순간까지.'}
            </p>
          </motion.div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((step, i) => (
              <motion.div
                key={step.en}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -3 }}
                className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm transition-shadow duration-300 hover:shadow-md"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-500">
                  {i + 1}
                </span>
                <span className="text-sm font-medium text-gray-700">
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
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
              <Link
                href="/quiz"
                className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition-shadow hover:shadow-blue-300"
              >
                {lang === "en" ? "Start Your Journey" : "여정 시작하기"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────── */}
      <section className="border-t border-gray-100 bg-white py-16">
        <div className="mx-auto max-w-4xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-10 sm:grid-cols-4"
          >
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-bold text-blue-500">{s.value}</div>
                <div className="mt-1 text-sm text-gray-400">
                  {lang === "en" ? s.label : s.labelKo}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 bg-gray-50 py-12">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <p className="text-sm font-medium text-gray-400">Made with care by Kelly</p>
          <p className="mt-2 text-xs text-gray-400">
            {lang === "en"
              ? "No personal data is stored. All journey data is anonymized."
              : "개인 정보는 저장되지 않습니다. 모든 여정 데이터는 익명화됩니다."}
          </p>
        </div>
      </footer>
    </div>
  );
}

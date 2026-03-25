"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Calculator,
  ChevronRight,
  CheckCircle2,
  Circle,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { journeySteps } from "@/lib/journey-steps";
import { Nav } from "@/components/nav";
import { useLanguageStore } from "@/lib/language-store";

interface QuizData {
  location: string;
  isFirstTimeBuyer: boolean;
  incomeRange: string;
  downPaymentRange: string;
  currentStep: string;
  hasOverseasProperty: boolean;
}

const stepMap: Record<string, number> = {
  "not-started": 0,
  researching: 1,
  "pre-approved": 3,
  searching: 4,
  "offer-made": 5,
};

export default function DashboardPage() {
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const { lang } = useLanguageStore();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("firsthome-quiz");
      if (stored) {
        const parsed = JSON.parse(stored);
        setQuiz(parsed);
        setCurrentStepIndex(stepMap[parsed.currentStep] || 0);
      }
    } catch {}
  }, []);

  const selectedStep = activeStep !== null ? journeySteps[activeStep] : null;

  return (
    <div className="min-h-screen bg-black text-white">
      <Nav />

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Red Flags */}
        {quiz?.hasOverseasProperty && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-start gap-3 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-5 py-4"
          >
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-400" />
            <div>
              <h4 className="text-sm font-semibold text-yellow-300">
                {lang === "en" ? "Overseas Property Detected" : "해외 부동산 감지됨"}
              </h4>
              <p className="mt-1 text-xs text-yellow-200/60">
                {lang === "en"
                  ? "This may affect your eligibility for SONYMA and other first-time buyer programs. Conventional loans are not affected."
                  : "SONYMA 및 기타 첫 주택 구매자 프로그램 자격에 영향을 줄 수 있습니다. Conventional 대출은 영향 없습니다."}{" "}
                <Link href="/chat" className="underline hover:text-yellow-200">
                  {lang === "en" ? "Ask AI for details →" : "AI에게 자세히 물어보기 →"}
                </Link>
              </p>
            </div>
          </motion.div>
        )}

        {/* Progress */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">
            {lang === "en" ? "Your Journey" : "나의 여정"}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {currentStepIndex === 0
              ? lang === "en"
                ? "Let's get started with your home buying journey."
                : "주택 구매 여정을 시작해 봅시다."
              : lang === "en"
                ? `You're at step ${currentStepIndex + 1} of 12.`
                : `12단계 중 ${currentStepIndex + 1}단계에 있습니다.`}
          </p>
          <div className="mt-4 h-1.5 w-full rounded-full bg-white/5">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 to-teal-400"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStepIndex + 1) / 12) * 100}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-6 flex gap-3">
          <Link
            href="/chat"
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-500"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            {lang === "en" ? "Ask AI" : "AI 질문"}
          </Link>
          <Link
            href="/calculator"
            className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-400 transition hover:text-white"
          >
            <Calculator className="h-3.5 w-3.5" />
            {lang === "en" ? "Calculator" : "계산기"}
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
          {/* Step List */}
          <div className="space-y-1">
            {journeySteps.map((step, i) => {
              const isCompleted = i < currentStepIndex;
              const isCurrent = i === currentStepIndex;
              const isActive = activeStep === i;

              return (
                <motion.button
                  key={step.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => setActiveStep(isActive ? null : i)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-all ${
                    isActive
                      ? "border border-blue-500/30 bg-blue-500/10"
                      : "border border-transparent hover:bg-white/[0.03]"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-green-400" />
                  ) : isCurrent ? (
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-blue-400">
                      <div className="h-2 w-2 rounded-full bg-blue-400" />
                    </div>
                  ) : (
                    <Circle className="h-5 w-5 shrink-0 text-zinc-700" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium truncate ${isCompleted ? "text-zinc-500" : isCurrent ? "text-white" : "text-zinc-600"}`}>
                      {lang === "en" ? step.name : step.nameKo}
                    </div>
                  </div>
                  <ChevronRight className={`h-4 w-4 shrink-0 transition ${isActive ? "rotate-90 text-blue-400" : "text-zinc-700"}`} />
                </motion.button>
              );
            })}
          </div>

          {/* Step Detail */}
          <div>
            {selectedStep ? (
              <motion.div
                key={selectedStep.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-white/5 bg-white/[0.02] p-8"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-sm font-bold text-blue-400">
                    {selectedStep.id}
                  </span>
                  <div>
                    <h2 className="text-xl font-bold">
                      {lang === "en" ? selectedStep.name : selectedStep.nameKo}
                    </h2>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-zinc-400">
                  {lang === "en" ? selectedStep.description : selectedStep.descriptionKo}
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <InfoCard
                    title={lang === "en" ? "Duration" : "소요 기간"}
                    value={lang === "en" ? selectedStep.duration : selectedStep.durationKo}
                  />
                  <InfoCard
                    title={lang === "en" ? "Estimated Cost" : "예상 비용"}
                    value={lang === "en" ? selectedStep.costs : selectedStep.costsKo}
                  />
                </div>

                {selectedStep.documents.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      {lang === "en" ? "Documents Needed" : "필요 서류"}
                    </h4>
                    <ul className="mt-2 space-y-1">
                      {(lang === "en" ? selectedStep.documents : selectedStep.documentsKo).map((d) => (
                        <li key={d} className="flex items-center gap-2 text-sm text-zinc-400">
                          <span className="h-1 w-1 rounded-full bg-zinc-600" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedStep.tips.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      {lang === "en" ? "Tips & Warnings" : "팁 & 주의사항"}
                    </h4>
                    <ul className="mt-2 space-y-2">
                      {(lang === "en" ? selectedStep.tips : selectedStep.tipsKo).map((t) => (
                        <li key={t} className="flex items-start gap-2 text-sm text-zinc-400">
                          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-yellow-500" />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedStep.stakeholders.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      {lang === "en" ? "Key People" : "주요 관계자"}
                    </h4>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedStep.stakeholders.map((s) => (
                        <span key={s} className="rounded-md bg-white/5 px-2 py-1 text-xs text-zinc-400">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-8">
                  <Link
                    href="/chat"
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
                  >
                    <MessageSquare className="h-4 w-4" />
                    {lang === "en" ? "Ask AI about this step" : "이 단계에 대해 AI에게 질문"}
                  </Link>
                </div>
              </motion.div>
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl border border-white/5 bg-white/[0.01] p-16">
                <div className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                    <span className="text-3xl">🏠</span>
                  </div>
                  <p className="mt-4 text-sm text-zinc-600">
                    {lang === "en" ? "Select a step to see details" : "단계를 선택하면 상세 정보를 볼 수 있어요"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
      <div className="text-xs text-zinc-600">{title}</div>
      <div className="mt-1 text-sm font-medium text-zinc-300">{value}</div>
    </div>
  );
}

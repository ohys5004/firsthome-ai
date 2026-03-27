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
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Nav />

      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Red Flags */}
        {quiz?.hasOverseasProperty && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4"
          >
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
            <div>
              <h4 className="text-sm font-semibold text-red-600">
                {lang === "en" ? "Overseas Property Detected" : "해외 부동산 감지됨"}
              </h4>
              <p className="mt-1 text-xs text-red-500">
                {lang === "en"
                  ? "This may affect your eligibility for SONYMA and other first-time buyer programs. Conventional loans are not affected."
                  : "SONYMA 및 기타 첫 주택 구매자 프로그램 자격에 영향을 줄 수 있습니다. Conventional 대출은 영향 없습니다."}{" "}
                <Link href="/chat" className="underline hover:text-red-700">
                  {lang === "en" ? "Ask AI for details →" : "AI에게 자세히 물어보기 →"}
                </Link>
              </p>
            </div>
          </motion.div>
        )}

        {/* Progress */}
        <div className="mb-8 rounded-2xl border border-gray-100 bg-white shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {lang === "en" ? "Your Journey" : "나의 여정"}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {currentStepIndex === 0
              ? lang === "en"
                ? "Let's get started with your home buying journey."
                : "주택 구매 여정을 시작해 봅시다."
              : lang === "en"
                ? `You're at step ${currentStepIndex + 1} of 12.`
                : `12단계 중 ${currentStepIndex + 1}단계에 있습니다.`}
          </p>
          <div className="mt-4 h-1.5 w-full rounded-full bg-gray-200">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
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
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-blue-300 hover:text-blue-600"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            {lang === "en" ? "Ask AI" : "AI 질문"}
          </Link>
          <Link
            href="/calculator"
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-blue-300 hover:text-blue-600"
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
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all ${
                    isActive
                      ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-100"
                      : "border-gray-100 bg-white hover:border-blue-200 hover:shadow-sm"
                  }`}
                >
                  <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    isCompleted
                      ? "bg-emerald-500 text-white"
                      : isCurrent
                      ? "bg-blue-500 text-white ring-4 ring-blue-100"
                      : "bg-gray-200 text-gray-500"
                  }`}>
                    {isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-medium truncate text-gray-900`}>
                      {lang === "en" ? step.name : step.nameKo}
                    </div>
                  </div>
                  <ChevronRight className={`h-4 w-4 shrink-0 transition ${isActive ? "rotate-90 text-blue-500" : "text-gray-400"}`} />
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
                className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6"
              >
                <div className="flex items-center gap-3">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${
                    activeStep !== null && activeStep < currentStepIndex
                      ? "bg-emerald-100 text-emerald-600"
                      : activeStep === currentStepIndex
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-400"
                  }`}>
                    {selectedStep.id}
                  </span>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {lang === "en" ? selectedStep.name : selectedStep.nameKo}
                    </h2>
                  </div>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-gray-500">
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
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {lang === "en" ? "Documents Needed" : "필요 서류"}
                    </h4>
                    <ul className="mt-2 space-y-1">
                      {(lang === "en" ? selectedStep.documents : selectedStep.documentsKo).map((d) => (
                        <li key={d} className="flex items-center gap-2 text-sm text-gray-700">
                          <span className="inline-block rounded-lg bg-gray-50 px-3 py-2 text-gray-700 text-xs">{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedStep.tips.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {lang === "en" ? "Tips & Warnings" : "팁 & 주의사항"}
                    </h4>
                    <ul className="mt-2 space-y-2">
                      {(lang === "en" ? selectedStep.tips : selectedStep.tipsKo).map((t) => (
                        <li key={t} className="flex items-start gap-2 text-sm text-gray-700">
                          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-500" />
                          <span className="bg-gray-50 rounded-lg px-3 py-2 text-gray-700 text-xs">{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedStep.stakeholders.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {lang === "en" ? "Key People" : "주요 관계자"}
                    </h4>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedStep.stakeholders.map((s) => (
                        <span key={s} className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-700">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-8">
                  <Link
                    href="/chat"
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-500 hover:bg-blue-600 px-4 py-2 text-sm font-medium text-white transition shadow-sm"
                  >
                    <MessageSquare className="h-4 w-4" />
                    {lang === "en" ? "Ask AI about this step" : "이 단계에 대해 AI에게 질문"}
                  </Link>
                </div>
              </motion.div>
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl border border-gray-100 bg-white p-16">
                <div className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
                    <span className="text-3xl">🏠</span>
                  </div>
                  <p className="mt-4 text-sm text-gray-400">
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
    <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="mt-1 text-sm font-medium text-gray-700">{value}</div>
    </div>
  );
}

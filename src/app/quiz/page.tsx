"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguageStore } from "@/lib/language-store";

interface QuizAnswer {
  location: string;
  isFirstTimeBuyer: boolean | null;
  incomeRange: string;
  downPaymentRange: string;
  currentStep: string;
  hasOverseasProperty: boolean | null;
}

const questions = [
  {
    id: "location",
    question: "Where do you want to buy?",
    questionKo: "어디에서 집을 사고 싶나요?",
    options: [
      { value: "nyc", label: "New York City", labelKo: "뉴욕시", emoji: "🗽" },
      { value: "ny-suburbs", label: "NY Suburbs", labelKo: "뉴욕 교외", emoji: "🏡" },
      { value: "nj", label: "New Jersey", labelKo: "뉴저지", emoji: "🌿" },
      { value: "other", label: "Other", labelKo: "기타", emoji: "📍" },
    ],
  },
  {
    id: "isFirstTimeBuyer",
    question: "Are you a first-time homebuyer?",
    questionKo: "처음 집을 사시는 건가요?",
    options: [
      { value: true, label: "Yes, first time", labelKo: "네, 처음이에요", emoji: "✨" },
      { value: false, label: "No, I've bought before", labelKo: "아니요, 경험 있어요", emoji: "🔄" },
    ],
  },
  {
    id: "hasOverseasProperty",
    question: "Do you own property outside the U.S.?",
    questionKo: "미국 외 국가에 부동산을 보유하고 있나요?",
    options: [
      { value: false, label: "No", labelKo: "아니요", emoji: "❌" },
      { value: true, label: "Yes", labelKo: "네", emoji: "🌏" },
    ],
  },
  {
    id: "incomeRange",
    question: "What's your approximate annual income?",
    questionKo: "대략적인 연 소득은?",
    options: [
      { value: "under-80k", label: "Under $80K", labelKo: "$80K 미만", emoji: "💰" },
      { value: "80k-120k", label: "$80K – $120K", labelKo: "$80K – $120K", emoji: "💰" },
      { value: "120k-200k", label: "$120K – $200K", labelKo: "$120K – $200K", emoji: "💰" },
      { value: "over-200k", label: "Over $200K", labelKo: "$200K 이상", emoji: "💰" },
    ],
  },
  {
    id: "downPaymentRange",
    question: "How much can you put down?",
    questionKo: "다운페이먼트 가능 금액은?",
    options: [
      { value: "under-20k", label: "Under $20K", labelKo: "$20K 미만", emoji: "🏦" },
      { value: "20k-50k", label: "$20K – $50K", labelKo: "$20K – $50K", emoji: "🏦" },
      { value: "50k-100k", label: "$50K – $100K", labelKo: "$50K – $100K", emoji: "🏦" },
      { value: "over-100k", label: "Over $100K", labelKo: "$100K 이상", emoji: "🏦" },
    ],
  },
  {
    id: "currentStep",
    question: "Where are you in the process?",
    questionKo: "현재 어느 단계인가요?",
    options: [
      { value: "not-started", label: "Haven't started yet", labelKo: "아직 시작 안 함", emoji: "🌱" },
      { value: "researching", label: "Researching", labelKo: "조사 중", emoji: "🔍" },
      { value: "pre-approved", label: "Got pre-approved", labelKo: "사전 승인 완료", emoji: "✅" },
      { value: "searching", label: "Looking at properties", labelKo: "매물 보는 중", emoji: "🏠" },
      { value: "offer-made", label: "Made an offer", labelKo: "오퍼 제출함", emoji: "📝" },
    ],
  },
];

export default function QuizPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer>({
    location: "",
    isFirstTimeBuyer: null,
    incomeRange: "",
    downPaymentRange: "",
    currentStep: "",
    hasOverseasProperty: null,
  });
  const router = useRouter();
  const { lang, toggleLang } = useLanguageStore();
  const current = questions[step];
  const progress = ((step + 1) / questions.length) * 100;

  function selectOption(value: string | boolean) {
    const updated = { ...answers, [current.id]: value };
    setAnswers(updated);

    if (step < questions.length - 1) {
      setTimeout(() => setStep(step + 1), 300);
    } else {
      localStorage.setItem("firsthome-quiz", JSON.stringify(updated));
      router.push("/dashboard");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
      {/* Header */}
      <div className="border-b border-gray-100 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-500 transition hover:text-gray-900">
            <span className="text-sm font-semibold">
              FirstHome<span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">AI</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">
              {step + 1} / {questions.length}
            </span>
            <button
              onClick={toggleLang}
              className="flex items-center gap-1 rounded-full border border-gray-200 px-2.5 py-1 text-xs text-gray-500 transition hover:text-gray-900"
            >
              <Globe className="h-3 w-3" />
              {lang === "en" ? "한국어" : "EN"}
            </button>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full bg-gray-200">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Question */}
      <div className="flex flex-1 items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-lg"
          >
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {lang === "en" ? current.question : current.questionKo}
            </h2>

            <div className="mt-8 flex flex-col gap-3">
              {current.options.map((option) => {
                const isSelected =
                  answers[current.id as keyof QuizAnswer] === option.value;
                return (
                  <motion.button
                    key={String(option.value)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => selectOption(option.value as string | boolean)}
                    className={`flex items-center gap-4 rounded-xl border px-5 py-4 text-left transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md shadow-blue-100"
                        : "border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:shadow-md"
                    }`}
                  >
                    <span className="text-xl">{option.emoji}</span>
                    <span className={`text-sm font-medium ${isSelected ? "text-blue-700" : "text-gray-700"}`}>
                      {lang === "en" ? option.label : option.labelKo}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Back / Skip buttons */}
      <div className="border-t border-gray-100 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-lg justify-between">
          <button
            onClick={() => step > 0 && setStep(step - 1)}
            className={`flex items-center gap-2 text-sm transition ${
              step > 0
                ? "text-gray-400 hover:text-gray-900"
                : "pointer-events-none text-gray-200"
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            {lang === "en" ? "Back" : "뒤로"}
          </button>
          <button
            onClick={() =>
              answers[current.id as keyof QuizAnswer] !== null &&
              answers[current.id as keyof QuizAnswer] !== "" &&
              step < questions.length - 1 &&
              setStep(step + 1)
            }
            className="flex items-center gap-2 text-sm text-gray-400 transition hover:text-gray-900"
          >
            {lang === "en" ? "Skip" : "건너뛰기"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

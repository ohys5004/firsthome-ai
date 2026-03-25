"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { calculateMortgage, type MortgageCalculation } from "@/lib/programs";
import { Nav } from "@/components/nav";
import { useLanguageStore } from "@/lib/language-store";

export default function CalculatorPage() {
  const { lang } = useLanguageStore();
  const [form, setForm] = useState({
    purchasePrice: 500000,
    downPaymentPercent: 10,
    annualIncome: 120000,
    monthlyDebt: 500,
    interestRate: 6.5,
    loanTermYears: 30,
    annualPropertyTax: 6000,
    monthlyHOA: 800,
    isFirstTimeBuyer: true,
    hasOverseasProperty: false,
    state: "NY",
  });

  const [result, setResult] = useState<MortgageCalculation | null>(null);

  function handleCalculate() {
    const calc = calculateMortgage(form);
    setResult(calc);
  }

  function updateField(field: string, value: number | boolean | string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Nav />

      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
            <Calculator className="h-5 w-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {lang === "en" ? "Mortgage Calculator" : "모기지 계산기"}
            </h1>
            <p className="text-sm text-zinc-500">
              {lang === "en" ? "DTI calculation + program matching" : "DTI 계산 + 프로그램 매칭"}
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Input Form */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
              <h3 className="mb-4 text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                {lang === "en" ? "Property" : "매물 정보"}
              </h3>
              <div className="space-y-4">
                <InputField label={lang === "en" ? "Purchase Price" : "매매 가격"} value={form.purchasePrice} onChange={(v) => updateField("purchasePrice", v)} prefix="$" />
                <InputField label={lang === "en" ? "Down Payment (%)" : "다운페이먼트 (%)"} value={form.downPaymentPercent} onChange={(v) => updateField("downPaymentPercent", v)} suffix="%" />
                <InputField label={lang === "en" ? "Annual Property Tax" : "연간 재산세"} value={form.annualPropertyTax} onChange={(v) => updateField("annualPropertyTax", v)} prefix="$" />
                <InputField label={lang === "en" ? "Monthly HOA" : "월 관리비 (HOA)"} value={form.monthlyHOA} onChange={(v) => updateField("monthlyHOA", v)} prefix="$" />
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
              <h3 className="mb-4 text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                {lang === "en" ? "Loan" : "대출 정보"}
              </h3>
              <div className="space-y-4">
                <InputField label={lang === "en" ? "Interest Rate" : "금리"} value={form.interestRate} onChange={(v) => updateField("interestRate", v)} suffix="%" step={0.1} />
                <InputField label={lang === "en" ? "Loan Term (years)" : "대출 기간 (년)"} value={form.loanTermYears} onChange={(v) => updateField("loanTermYears", v)} />
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
              <h3 className="mb-4 text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                {lang === "en" ? "Your Finances" : "재정 정보"}
              </h3>
              <div className="space-y-4">
                <InputField label={lang === "en" ? "Annual Income" : "연 소득"} value={form.annualIncome} onChange={(v) => updateField("annualIncome", v)} prefix="$" />
                <InputField label={lang === "en" ? "Monthly Debt (car, student loans, etc.)" : "월 부채 (자동차, 학자금 대출 등)"} value={form.monthlyDebt} onChange={(v) => updateField("monthlyDebt", v)} prefix="$" />
                <div className="flex gap-4">
                  <ToggleButton label={lang === "en" ? "First-time buyer" : "첫 주택 구매자"} value={form.isFirstTimeBuyer} onChange={(v) => updateField("isFirstTimeBuyer", v)} />
                  <ToggleButton label={lang === "en" ? "Overseas property" : "해외 부동산"} value={form.hasOverseasProperty} onChange={(v) => updateField("hasOverseasProperty", v)} />
                </div>
              </div>
            </div>

            <button
              onClick={handleCalculate}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 py-3 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-blue-500/25"
            >
              {lang === "en" ? "Calculate" : "계산하기"}
            </button>
          </div>

          {/* Results */}
          <div>
            {result ? (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                {/* Monthly Payment */}
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
                  <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                    {lang === "en" ? "Monthly Payment" : "월 납부액"}
                  </h3>
                  <div className="mt-4 text-4xl font-bold">
                    <span className="bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                      ${result.monthlyTotal.toLocaleString()}
                    </span>
                    <span className="text-lg text-zinc-500">/mo</span>
                  </div>
                  <div className="mt-4 space-y-2">
                    <CostRow label={lang === "en" ? "Principal & Interest" : "원금 + 이자"} value={result.monthlyPI} />
                    <CostRow label={lang === "en" ? "Property Tax" : "재산세"} value={result.monthlyTax} />
                    <CostRow label={lang === "en" ? "Insurance" : "보험"} value={result.monthlyInsurance} />
                    <CostRow label="HOA" value={result.monthlyHOA} />
                    {result.monthlyPMI > 0 && <CostRow label="PMI" value={result.monthlyPMI} highlight />}
                  </div>
                </div>

                {/* DTI */}
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
                  <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                    {lang === "en" ? "DTI Ratio" : "DTI 비율"}
                  </h3>
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <DTICard label={lang === "en" ? "Front-end DTI" : "프론트엔드 DTI"} value={result.frontEndDTI} max={28} />
                    <DTICard label={lang === "en" ? "Back-end DTI" : "백엔드 DTI"} value={result.backEndDTI} max={43} />
                  </div>
                </div>

                {/* Loan Details */}
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
                  <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                    {lang === "en" ? "Loan Details" : "대출 상세"}
                  </h3>
                  <div className="mt-4 space-y-2">
                    <CostRow label={lang === "en" ? "Down Payment" : "다운페이먼트"} value={result.downPaymentAmount} />
                    <CostRow label={lang === "en" ? "Loan Amount" : "대출 금액"} value={result.loanAmount} />
                  </div>
                </div>

                {/* Eligible Programs */}
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
                  <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                    {lang === "en" ? "Eligible Programs" : "자격 프로그램"}
                  </h3>
                  {result.eligiblePrograms.length > 0 ? (
                    <div className="mt-4 space-y-3">
                      {result.eligiblePrograms.map((p) => (
                        <div key={p.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                            <div>
                              <div className="text-sm font-semibold">{p.name}</div>
                              <div className="mt-1 text-xs text-zinc-500">{p.description}</div>
                              <div className="mt-2 flex flex-wrap gap-1">
                                {p.highlights.map((h) => (
                                  <span key={h} className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-zinc-400">
                                    {h}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 flex items-start gap-2 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" />
                      <div className="text-sm text-yellow-200">
                        {lang === "en"
                          ? "No programs matched your criteria. Try adjusting your down payment or check if overseas property affects your eligibility."
                          : "매칭되는 프로그램이 없습니다. 다운페이먼트를 조정하거나 해외 부동산이 자격에 영향을 미치는지 확인하세요."}
                      </div>
                    </div>
                  )}
                </div>

                {/* Red Flags */}
                {form.hasOverseasProperty && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                      <div>
                        <h4 className="text-sm font-semibold text-red-300">
                          {lang === "en" ? "Red Flag: Overseas Property" : "위험: 해외 부동산"}
                        </h4>
                        <p className="mt-1 text-sm text-red-200/70">
                          {lang === "en"
                            ? "Owning property outside the U.S. disqualifies you from SONYMA and may affect other first-time buyer programs. Conventional loans are NOT affected. Disclose this to your mortgage broker immediately."
                            : "미국 외 부동산 소유는 SONYMA 자격을 박탈하며 다른 첫 주택 구매 프로그램에도 영향을 줄 수 있습니다. Conventional 대출은 영향 없습니다. 모기지 브로커에게 즉시 공개하세요."}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {result.backEndDTI > 43 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />
                      <div>
                        <h4 className="text-sm font-semibold text-red-300">
                          {lang === "en" ? "Red Flag: High DTI" : "위험: 높은 DTI"}
                        </h4>
                        <p className="mt-1 text-sm text-red-200/70">
                          {lang === "en"
                            ? `Your back-end DTI (${result.backEndDTI}%) exceeds the conventional limit of 43%. Consider a lower purchase price or paying off some debt first.`
                            : `백엔드 DTI (${result.backEndDTI}%)가 Conventional 한도 43%를 초과합니다. 매매가를 낮추거나 부채를 먼저 상환하는 것을 고려하세요.`}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <div className="flex h-full items-center justify-center rounded-2xl border border-white/5 bg-white/[0.01] p-12">
                <div className="text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10">
                    <Calculator className="h-8 w-8 text-zinc-700" />
                  </div>
                  <p className="mt-4 text-sm text-zinc-600">
                    {lang === "en"
                      ? "Fill in your details and click Calculate"
                      : "정보를 입력하고 계산하기를 클릭하세요"}
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

function InputField({
  label, value, onChange, prefix, suffix, step,
}: {
  label: string; value: number; onChange: (v: number) => void; prefix?: string; suffix?: string; step?: number;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-zinc-500">{label}</label>
      <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 transition-colors focus-within:border-blue-500/50">
        {prefix && <span className="text-sm text-zinc-500">{prefix}</span>}
        <input
          type="number"
          value={value}
          step={step}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="w-full bg-transparent text-sm text-white outline-none"
        />
        {suffix && <span className="text-sm text-zinc-500">{suffix}</span>}
      </div>
    </div>
  );
}

function ToggleButton({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
        value
          ? "border-blue-500/50 bg-blue-500/10 text-blue-300"
          : "border-white/10 bg-white/5 text-zinc-500"
      }`}
    >
      {label}: {value ? "Yes" : "No"}
    </button>
  );
}

function CostRow({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <span className={highlight ? "text-yellow-400" : "text-zinc-500"}>{label}</span>
      <span className={highlight ? "text-yellow-400" : "text-white"}>${value.toLocaleString()}</span>
    </div>
  );
}

function DTICard({ label, value, max }: { label: string; value: number; max: number }) {
  const isOver = value > max;
  return (
    <div className={`rounded-xl border p-4 ${isOver ? "border-red-500/30 bg-red-500/5" : "border-white/5 bg-white/[0.02]"}`}>
      <div className="text-xs text-zinc-500">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${isOver ? "text-red-400" : "bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent"}`}>
        {value}%
      </div>
      <div className="mt-1 text-xs text-zinc-600">
        {isOver ? `Over ${max}% limit` : `Under ${max}% limit`}
      </div>
    </div>
  );
}

export interface MortgageProgram {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  descriptionKo: string;
  minDownPayment: number;
  maxDTI: number;
  firstTimeOnly: boolean;
  overseasPropertyAllowed: boolean;
  maxIncome?: number;
  maxLoanAmount?: number;
  pmi: boolean;
  sellerCreditMax: number;
  state: string;
  highlights: string[];
  highlightsKo: string[];
}

export const programs: MortgageProgram[] = [
  {
    id: "sonyma",
    name: "SONYMA (State of New York Mortgage Agency)",
    nameKo: "SONYMA (뉴욕주 모기지 기관)",
    description: "NY state program for first-time buyers with low down payment and competitive rates.",
    descriptionKo: "뉴욕주 first-time buyer 전용 프로그램. 낮은 다운페이먼트와 경쟁력 있는 이자율.",
    minDownPayment: 3,
    maxDTI: 45,
    firstTimeOnly: true,
    overseasPropertyAllowed: false,
    maxIncome: 150000,
    maxLoanAmount: 726200,
    pmi: true,
    sellerCreditMax: 6,
    state: "NY",
    highlights: [
      "Down payment as low as 3%",
      "Down payment assistance available (up to $15,000)",
      "Below-market interest rates",
    ],
    highlightsKo: [
      "다운페이먼트 최저 3%",
      "다운페이먼트 보조금 가능 (최대 $15,000)",
      "시장 이하 이자율",
    ],
  },
  {
    id: "fha",
    name: "FHA (Federal Housing Administration)",
    nameKo: "FHA (연방 주택 관리청)",
    description: "Federal program with low down payment and flexible credit requirements.",
    descriptionKo: "낮은 다운페이먼트와 유연한 신용 요건의 연방 프로그램.",
    minDownPayment: 3.5,
    maxDTI: 50,
    firstTimeOnly: false,
    overseasPropertyAllowed: true,
    maxLoanAmount: 1149825,
    pmi: true,
    sellerCreditMax: 6,
    state: "ALL",
    highlights: [
      "Down payment as low as 3.5%",
      "Credit score as low as 580",
      "Not limited to first-time buyers",
    ],
    highlightsKo: [
      "다운페이먼트 최저 3.5%",
      "신용점수 580까지 가능",
      "First-time buyer 한정이 아님",
    ],
  },
  {
    id: "conventional",
    name: "Conventional Loan",
    nameKo: "컨벤셔널 론 (일반 대출)",
    description: "Standard mortgage with competitive rates. Best for buyers with good credit and larger down payments.",
    descriptionKo: "경쟁력 있는 이자율의 표준 모기지. 좋은 신용과 큰 다운페이먼트에 최적.",
    minDownPayment: 5,
    maxDTI: 43,
    firstTimeOnly: false,
    overseasPropertyAllowed: true,
    maxLoanAmount: 766550,
    pmi: true,
    sellerCreditMax: 3,
    state: "ALL",
    highlights: [
      "No PMI with 20%+ down payment",
      "No income limits",
      "Overseas property does NOT affect eligibility",
    ],
    highlightsKo: [
      "20% 이상 다운페이먼트 시 PMI 없음",
      "소득 제한 없음",
      "해외 부동산이 자격에 영향 없음",
    ],
  },
  {
    id: "conventional-3",
    name: "Conventional 97 (3% Down)",
    nameKo: "컨벤셔널 97 (3% 다운)",
    description: "Conventional loan with only 3% down for first-time buyers.",
    descriptionKo: "First-time buyer 전용 3% 다운페이먼트 컨벤셔널 론.",
    minDownPayment: 3,
    maxDTI: 43,
    firstTimeOnly: true,
    overseasPropertyAllowed: true,
    maxLoanAmount: 766550,
    pmi: true,
    sellerCreditMax: 3,
    state: "ALL",
    highlights: [
      "Only 3% down payment",
      "First-time buyer required",
      "PMI required until 20% equity",
    ],
    highlightsKo: [
      "3% 다운페이먼트만 필요",
      "First-time buyer 필수",
      "20% 자기자본 달성까지 PMI 필수",
    ],
  },
];

export interface MortgageCalculation {
  monthlyPI: number;
  monthlyTax: number;
  monthlyInsurance: number;
  monthlyHOA: number;
  monthlyPMI: number;
  monthlyTotal: number;
  downPaymentAmount: number;
  loanAmount: number;
  frontEndDTI: number;
  backEndDTI: number;
  eligiblePrograms: MortgageProgram[];
}

export function calculateMortgage(params: {
  purchasePrice: number;
  downPaymentPercent: number;
  annualIncome: number;
  monthlyDebt: number;
  interestRate: number;
  loanTermYears: number;
  annualPropertyTax: number;
  monthlyHOA: number;
  isFirstTimeBuyer: boolean;
  hasOverseasProperty: boolean;
  state: string;
}): MortgageCalculation {
  const {
    purchasePrice,
    downPaymentPercent,
    annualIncome,
    monthlyDebt,
    interestRate,
    loanTermYears,
    annualPropertyTax,
    monthlyHOA,
    isFirstTimeBuyer,
    hasOverseasProperty,
    state,
  } = params;

  const downPaymentAmount = purchasePrice * (downPaymentPercent / 100);
  const loanAmount = purchasePrice - downPaymentAmount;
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = loanTermYears * 12;

  const monthlyPI =
    monthlyRate === 0
      ? loanAmount / numPayments
      : (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
        (Math.pow(1 + monthlyRate, numPayments) - 1);

  const monthlyTax = annualPropertyTax / 12;
  const monthlyInsurance = (purchasePrice * 0.005) / 12;
  const monthlyPMI = downPaymentPercent < 20 ? (loanAmount * 0.008) / 12 : 0;
  const monthlyTotal = monthlyPI + monthlyTax + monthlyInsurance + monthlyHOA + monthlyPMI;

  const monthlyIncome = annualIncome / 12;
  const frontEndDTI = (monthlyTotal / monthlyIncome) * 100;
  const backEndDTI = ((monthlyTotal + monthlyDebt) / monthlyIncome) * 100;

  const eligiblePrograms = programs.filter((p) => {
    if (p.firstTimeOnly && !isFirstTimeBuyer) return false;
    if (!p.overseasPropertyAllowed && hasOverseasProperty) return false;
    if (p.state !== "ALL" && p.state !== state) return false;
    if (p.maxIncome && annualIncome > p.maxIncome) return false;
    if (p.maxLoanAmount && loanAmount > p.maxLoanAmount) return false;
    if (downPaymentPercent < p.minDownPayment) return false;
    return true;
  });

  return {
    monthlyPI: Math.round(monthlyPI),
    monthlyTax: Math.round(monthlyTax),
    monthlyInsurance: Math.round(monthlyInsurance),
    monthlyHOA,
    monthlyPMI: Math.round(monthlyPMI),
    monthlyTotal: Math.round(monthlyTotal),
    downPaymentAmount: Math.round(downPaymentAmount),
    loanAmount: Math.round(loanAmount),
    frontEndDTI: Math.round(frontEndDTI * 10) / 10,
    backEndDTI: Math.round(backEndDTI * 10) / 10,
    eligiblePrograms,
  };
}

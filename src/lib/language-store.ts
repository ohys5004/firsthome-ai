import { create } from "zustand";

type Language = "en" | "ko";

interface LanguageState {
  lang: Language;
  toggleLang: () => void;
  setLang: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  lang: "en",
  toggleLang: () => set((s) => ({ lang: s.lang === "en" ? "ko" : "en" })),
  setLang: (lang) => set({ lang }),
}));

export function t(lang: Language, en: string, ko: string): string {
  return lang === "en" ? en : ko;
}

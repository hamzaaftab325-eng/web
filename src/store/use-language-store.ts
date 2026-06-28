"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Language store — manages the active UI language (English / Urdu).
 *
 * Supports English (en) and Urdu (ur). When Urdu is active:
 * - <html dir="rtl"> is set for right-to-left text direction
 * - <html lang="ur"> is set for screen readers
 * - UI strings are translated via the useTranslation hook
 *
 * Product content (names, descriptions) stays English (mock data) —
 * real i18n happens when the backend supports it.
 *
 * Persists to localStorage.
 */

export type LanguageCode = "en" | "ur";

interface LanguageState {
  language: LanguageCode;
  setLanguage: (code: LanguageCode) => void;
  toggle: () => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set, get) => ({
      language: "en",

      setLanguage: (code) => {
        set({ language: code });
        applyLanguage(code);
      },

      toggle: () => {
        const next = get().language === "en" ? "ur" : "en";
        set({ language: next });
        applyLanguage(next);
      },
    }),
    {
      name: "aura-language",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ language: s.language }),
      onRehydrateStorage: () => (state) => {
        if (state) applyLanguage(state.language);
      },
    }
  )
);

/** Apply language to the DOM: set lang + dir attributes on <html>. */
function applyLanguage(code: LanguageCode) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = code;
  document.documentElement.dir = code === "ur" ? "rtl" : "ltr";
}

/**
 * Initialize language from store on app mount.
 * Called from AppChrome or layout.
 */
export function initLanguage() {
  const state = useLanguageStore.getState();
  applyLanguage(state.language);
}

"use client";

import { useCallback } from "react";
import { useLanguageStore, type LanguageCode } from "@/store/use-language-store";
import enMessages from "@/messages/en.json";
import urMessages from "@/messages/ur.json";

/**
 * useTranslation — reactive translation hook for English / Urdu.
 *
 * Returns a `t()` function that looks up a translation key in the
 * active language. Keys use dot notation: t("nav.shop"), t("cart.total").
 *
 * If the key is not found in the active language, falls back to English.
 * If not found in English, returns the key itself (for debugging).
 *
 * Usage:
 *   const { t, lang, isRTL } = useTranslation();
 *   <button>{t("nav.shop")}</button>
 *   <div dir={isRTL ? "rtl" : "ltr"}>
 */

type Messages = Record<string, unknown>;

const MESSAGES: Record<LanguageCode, Messages> = {
  en: enMessages as Messages,
  ur: urMessages as Messages,
};

/** Look up a dot-notation key in a messages object. */
function lookup(messages: Messages, key: string): string | undefined {
  const parts = key.split(".");
  let current: unknown = messages;

  for (const part of parts) {
    if (typeof current !== "object" || current === null) return undefined;
    current = (current as Record<string, unknown>)[part];
  }

  return typeof current === "string" ? current : undefined;
}

export function useTranslation() {
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);
  const toggle = useLanguageStore((s) => s.toggle);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      // Try active language first, then fall back to English
      const activeResult = lookup(MESSAGES[language], key);
      const result = activeResult ?? lookup(MESSAGES.en, key) ?? key;

      // Replace {param} placeholders
      if (params) {
        return Object.entries(params).reduce(
          (str, [param, value]) => str.replace(`{${param}}`, String(value)),
          result
        );
      }

      return result;
    },
    [language]
  );

  return {
    t,
    lang: language,
    isRTL: language === "ur",
    setLanguage,
    toggle,
  };
}

export default useTranslation;

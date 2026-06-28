"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Globe, Check } from "lucide-react";
import { useLanguageStore, type LanguageCode } from "@/store/use-language-store";
import { cn } from "@/lib/utils";

/**
 * LanguageSelector — compact dropdown for switching between English and Urdu.
 *
 * Shows a globe icon + active language code (EN / اردو). Click opens a
 * dropdown with both options. When Urdu is selected, the entire site
 * switches to RTL (right-to-left) layout via the language store.
 * Persists to localStorage. Honors prefers-reduced-motion.
 */

const OPTIONS: { code: LanguageCode; label: string; nativeLabel: string }[] = [
  { code: "en", label: "EN", nativeLabel: "English" },
  { code: "ur", label: "اردو", nativeLabel: "Urdu" },
];

export function LanguageSelector({ className }: { className?: string }) {
  const prefersReducedMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const language = useLanguageStore((s) => s.language);
  const setLanguage = useLanguageStore((s) => s.setLanguage);

  const activeOption = OPTIONS.find((o) => o.code === language) ?? OPTIONS[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label={`Language: ${activeOption.nativeLabel}`}
        aria-expanded={open}
        className={cn(
          "flex items-center gap-1 t-label-caps transition-colors hover:text-gold py-1 px-1",
          className
        )}
      >
        <Globe size={14} strokeWidth={1.5} />
        <span className="hidden sm:inline">{activeOption.label}</span>
        <ChevronDownSmall open={open} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-overlay"
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <motion.div
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-full right-0 mt-2 z-modal bg-paper border border-hairline-cream rounded-sm shadow-elevated overflow-hidden min-w-[140px]"
            >
              {OPTIONS.map((option) => {
                const isActive = option.code === language;
                return (
                  <button
                    key={option.code}
                    onClick={() => {
                      setLanguage(option.code);
                      setOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between gap-2 px-4 py-2.5 t-body-sm transition-colors text-left",
                      isActive
                        ? "c-gold-deep bg-gold-pale/50"
                        : "c-ink hover:bg-cream"
                    )}
                  >
                    <span>{option.nativeLabel}</span>
                    {isActive && <Check size={12} strokeWidth={2} />}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChevronDownSmall({ open }: { open: boolean }) {
  return (
    <svg
      width={10}
      height={10}
      viewBox="0 0 10 10"
      fill="none"
      className={cn("transition-transform", open && "rotate-180")}
      aria-hidden
    >
      <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default LanguageSelector;

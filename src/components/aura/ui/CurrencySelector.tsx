"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { useCurrencyStore, type CurrencyCode } from "@/store/use-currency-store";
import { cn } from "@/lib/utils";

/**
 * CurrencySelector — compact dropdown for switching between PKR and USD.
 *
 * Shows the active currency code (₨ or $). Click opens a small dropdown
 * with both options. Persists to localStorage via the currency store.
 * Honors prefers-reduced-motion.
 */

const OPTIONS: { code: CurrencyCode; label: string; symbol: string }[] = [
  { code: "PKR", label: "PKR", symbol: "₨" },
  { code: "USD", label: "USD", symbol: "$" },
];

export function CurrencySelector({ className }: { className?: string }) {
  const prefersReducedMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const currency = useCurrencyStore((s) => s.currency);
  const setCurrency = useCurrencyStore((s) => s.setCurrency);

  const activeOption = OPTIONS.find((o) => o.code === currency) ?? OPTIONS[0];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        aria-label={`Currency: ${activeOption.label}`}
        aria-expanded={open}
        className={cn(
          "flex items-center gap-1 t-label-caps transition-colors hover:text-gold py-1 px-1",
          className
        )}
      >
        <span className="t-num">{activeOption.symbol}</span>
        <span className="hidden sm:inline">{activeOption.label}</span>
        <ChevronDown
          size={12}
          strokeWidth={1.5}
          className={cn("transition-transform", open && "rotate-180")}
        />
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
              className="absolute top-full right-0 mt-2 z-modal bg-paper border border-hairline-cream rounded-sm shadow-elevated overflow-hidden min-w-[120px]"
            >
              {OPTIONS.map((option) => {
                const isActive = option.code === currency;
                return (
                  <button
                    key={option.code}
                    onClick={() => {
                      setCurrency(option.code);
                      setOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between gap-2 px-4 py-2.5 t-body-sm transition-colors text-left",
                      isActive
                        ? "c-gold-deep bg-gold-pale/50"
                        : "c-ink hover:bg-cream"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span className="t-num w-4">{option.symbol}</span>
                      {option.label}
                    </span>
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

export default CurrencySelector;

"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Square custom checkbox — accessible (role="checkbox", aria-checked).
 *
 * Phase 5A: Extracted from SignupView.tsx (was inline at lines 105-137).
 * Used by the signup form for newsletter opt-in and terms acceptance.
 *
 * Touch target: 44×44px minimum (via padding + negative margin trick).
 */

export interface SquareToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  id?: string;
  invalid?: boolean;
}

export function SquareToggle({ checked, onChange, label, id, invalid }: SquareToggleProps) {
  return (
    <button
      type="button"
      role="checkbox"
      id={id}
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "shrink-0 w-5 h-5 border flex items-center justify-center transition-colors duration-300",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
        /* 44px minimum touch target on mobile */
        "min-w-[44px] min-h-[44px] p-[10px] -m-[10px]",
        checked
          ? "bg-ink border-ink"
          : invalid
            ? "bg-transparent border-error"
            : "bg-transparent border-hairline-strong hover:border-gold"
      )}
    >
      {checked && <Check size={12} strokeWidth={2.5} className="c-paper" />}
    </button>
  );
}

export default SquareToggle;

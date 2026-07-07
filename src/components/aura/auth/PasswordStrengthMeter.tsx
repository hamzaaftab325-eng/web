"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Password strength meter + requirements checklist.
 *
 * Phase 5A: Extracted from SignupView.tsx (was inline at lines 63-100 + 397-439).
 * Shows a 4-segment strength bar + a checklist of requirements (8+ chars, number,
 * upper/lower case, special character).
 *
 * Used by the signup form. Could also be reused by reset-password and
 * change-password flows in the future.
 */

export interface StrengthCheck {
  len: boolean;
  num: boolean;
  caseOk: boolean;
  special: boolean;
}

export function evaluatePassword(pw: string): { score: 0 | 1 | 2 | 3 | 4; checks: StrengthCheck } {
  const checks: StrengthCheck = {
    len: pw.length >= 8,
    num: /[0-9]/.test(pw),
    caseOk: /[a-z]/.test(pw) && /[A-Z]/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
  };
  const score = (["len", "num", "caseOk", "special"] as const).filter(
    (k) => checks[k]
  ).length as 0 | 1 | 2 | 3 | 4;
  return { score, checks };
}

const STRENGTH_COLOR: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: "bg-ink-faint/30",
  1: "bg-error",
  2: "c-warning",
  3: "bg-gold",
  4: "bg-success",
};

const STRENGTH_LABEL: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: "—",
  1: "Weak",
  2: "Fair",
  3: "Good",
  4: "Strong",
};

const REQUIREMENTS: { key: keyof StrengthCheck; label: string }[] = [
  { key: "len", label: "8+ characters" },
  { key: "num", label: "One number" },
  { key: "caseOk", label: "Upper & lower case" },
  { key: "special", label: "Special character" },
];

export interface PasswordStrengthMeterProps {
  password: string;
  /** Element ID for the container (used by aria-describedby on the password input). */
  id?: string;
}

export function PasswordStrengthMeter({ password, id }: PasswordStrengthMeterProps) {
  const { score, checks } = evaluatePassword(password || "");

  return (
    <div id={id} className="mt-2.5">
      {/* Strength bar */}
      <div className="flex items-center gap-1.5">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-300",
              i < score ? STRENGTH_COLOR[score] : "bg-ink-faint/15"
            )}
          />
        ))}
        <span className="t-caption c-ink-faint ml-2 w-12 text-right tabular-nums">
          {password ? STRENGTH_LABEL[score] : "—"}
        </span>
      </div>

      {/* Requirements checklist */}
      <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
        {REQUIREMENTS.map((req) => {
          const ok = checks[req.key];
          return (
            <li
              key={req.key}
              className={cn(
                "inline-flex items-center gap-1.5 t-caption transition-colors",
                ok ? "c-success" : "c-ink-faint"
              )}
            >
              <span
                className={cn(
                  "shrink-0 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full border transition-colors",
                  ok ? "bg-success border-success" : "border-hairline-strong"
                )}
              >
                {ok && <Check size={9} strokeWidth={3} className="c-paper" />}
              </span>
              {req.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default PasswordStrengthMeter;

"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Check,
} from "lucide-react";
import { AuthShell } from "./AuthShell";
import { Button } from "@/components/aura/ui/Button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

/* ────────────────────────────────────────────────────────────────────────
   Schema — inline Zod
   ──────────────────────────────────────────────────────────────────────── */
const resetSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[0-9]/, "Add at least one number")
      .regex(/[A-Z]/, "Add at least one uppercase letter")
      .regex(/[a-z]/, "Add at least one lowercase letter")
      .regex(/[^A-Za-z0-9]/, "Add at least one special character"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetValues = z.infer<typeof resetSchema>;

/* ────────────────────────────────────────────────────────────────────────
   Strength meter helpers
   ──────────────────────────────────────────────────────────────────────── */
interface StrengthCheck {
  len: boolean;
  num: boolean;
  caseOk: boolean;
  special: boolean;
}

function evaluatePassword(pw: string): {
  score: 0 | 1 | 2 | 3 | 4;
  checks: StrengthCheck;
} {
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

const STRENGTH_BAR: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: "bg-ink-faint/30",
  1: "bg-error",
  2: "bg-warning",
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

/* ────────────────────────────────────────────────────────────────────────
   ResetPasswordView
   ──────────────────────────────────────────────────────────────────────── */
export function ResetPasswordView() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  const [showNew, setShowNew] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [completed, setCompleted] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const newPasswordValue = useWatch({ control, name: "newPassword" }) ?? "";
  const confirmPasswordValue = useWatch({ control, name: "confirmPassword" }) ?? "";
  const { score, checks } = evaluatePassword(newPasswordValue || "");
  const passwordsMatch =
    confirmPasswordValue.length > 0 &&
    newPasswordValue === confirmPasswordValue;

  const onSubmit = async (values: ResetValues) => {
    setServerError(null);
    await new Promise<void>((resolve) => setTimeout(resolve, 700));
    // Mock: the reset always succeeds for the demo flow.
    if (values.newPassword !== values.confirmPassword) {
      setServerError("Passwords do not match.");
      return;
    }
    setCompleted(true);
  };

  const goLogin = () => router.push("/login");

  const footer = (
    <p className="t-body c-ink-muted text-center">
      Need help?{" "}
      <button
        type="button"
        onClick={goLogin}
        className="c-ink hover:c-gold-deep link-underline font-medium"
      >
        Contact concierge
      </button>
    </p>
  );

  const requirements: { key: keyof StrengthCheck; label: string }[] = [
    { key: "len", label: "8+ characters" },
    { key: "num", label: "One number" },
    { key: "caseOk", label: "Upper & lower case" },
    { key: "special", label: "Special character" },
  ];

  return (
    <AuthShell
      eyebrow="New Password"
      title={
        completed ? (
          <>
            Password{" "}
            <span className="t-italic-display c-gold-deep">updated</span>.
          </>
        ) : (
          <>
            Choose a new{" "}
            <span className="t-italic-display c-gold-deep">password</span>.
          </>
        )
      }
      subtitle={
        completed
          ? "Your Aura account password has been reset. You can now sign in with your new credentials."
          : "Pick a strong password you haven't used before. We'll ask you to confirm it below."
      }
      footer={footer}
      backTo="login"
    >
      <AnimatePresence mode="wait">
        {completed ? (
          <motion.div
            key="success"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
            className="space-y-6"
          >
            {/* Check icon in gold-pale circle */}
            <div className="flex justify-center">
              <motion.div
                initial={prefersReducedMotion ? false : { scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  duration: 0.5,
                  ease: [0.34, 1.56, 0.64, 1] as const,
                }}
              >
                <div className="w-20 h-20 rounded-full bg-gold-pale flex items-center justify-center shadow-gold-glow">
                  <motion.span
                    initial={prefersReducedMotion ? false : { scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      delay: 0.15,
                      duration: 0.45,
                      ease: [0.34, 1.56, 0.64, 1] as const,
                    }}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-gold"
                  >
                    <Check size={18} strokeWidth={2.5} className="c-paper" />
                  </motion.span>
                </div>
              </motion.div>
            </div>

            <div className="bg-gradient-card-warm border-hairline-cream p-5 shadow-card-modern">
              <p className="t-body c-ink leading-relaxed">
                Your password was updated successfully. For your security,
                any other active sessions on this account have been signed out.
              </p>
            </div>

            <Button
              type="button"
              variant="primary"
              size="lg"
              fullWidth
              onClick={goLogin}
            >
              <ArrowLeft size={16} strokeWidth={1.5} />
              Continue to sign in
            </Button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-5"
          >
            {serverError && (
              <motion.div
                initial={prefersReducedMotion ? false : { opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2.5 bg-error/5 border border-error/25 px-3.5 py-3"
                role="alert"
              >
                <AlertCircle size={15} strokeWidth={1.75} className="c-error shrink-0 mt-0.5" />
                <p className="t-body-sm c-error">{serverError}</p>
              </motion.div>
            )}

            {/* New password */}
            <div>
              <label htmlFor="reset-new" className="t-label-caps c-ink-faint block mb-2">
                New password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  strokeWidth={1.5}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 c-ink-faint pointer-events-none"
                />
                <input
                  id="reset-new"
                  type={showNew ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Create a new password"
                  aria-invalid={Boolean(errors.newPassword) || undefined}
                  aria-describedby={
                    errors.newPassword ? "reset-new-error" : "reset-new-strength"
                  }
                  className={cn(
                    "w-full bg-transparent border border-hairline pl-11 pr-11 py-3 t-body c-ink",
                    "placeholder:c-ink-faint focus:border-ink focus:outline-none transition-colors",
                    errors.newPassword && "border-error focus:border-error"
                  )}
                  {...register("newPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 c-ink-faint hover:c-gold-deep transition-colors p-2.5"
                  aria-label={showNew ? "Hide password" : "Show password"}
                  aria-pressed={showNew}
                >
                  {showNew ? (
                    <EyeOff size={16} strokeWidth={1.5} />
                  ) : (
                    <Eye size={16} strokeWidth={1.5} />
                  )}
                </button>
              </div>

              {/* Strength meter */}
              <div id="reset-new-strength" className="mt-2.5">
                <div className="flex items-center gap-1.5">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-1 flex-1 rounded-full transition-colors duration-300",
                        i < score ? STRENGTH_BAR[score] : "bg-ink-faint/15"
                      )}
                    />
                  ))}
                  <span className="t-caption c-ink-faint ml-2 w-12 text-right tabular-nums">
                    {newPasswordValue ? STRENGTH_LABEL[score] : "—"}
                  </span>
                </div>

                <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
                  {requirements.map((req) => {
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

              {errors.newPassword && (
                <p id="reset-new-error" className="t-caption c-error mt-1.5" role="alert">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="reset-confirm" className="t-label-caps c-ink-faint block mb-2">
                Confirm new password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  strokeWidth={1.5}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 c-ink-faint pointer-events-none"
                />
                <input
                  id="reset-confirm"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Re-enter your new password"
                  aria-invalid={Boolean(errors.confirmPassword) || undefined}
                  aria-describedby={
                    errors.confirmPassword ? "reset-confirm-error" : undefined
                  }
                  className={cn(
                    "w-full bg-transparent border border-hairline pl-11 pr-11 py-3 t-body c-ink",
                    "placeholder:c-ink-faint focus:border-ink focus:outline-none transition-colors",
                    errors.confirmPassword && "border-error focus:border-error",
                    passwordsMatch && "border-success focus:border-success"
                  )}
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 c-ink-faint hover:c-gold-deep transition-colors p-2.5"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                  aria-pressed={showConfirm}
                >
                  {showConfirm ? (
                    <EyeOff size={16} strokeWidth={1.5} />
                  ) : (
                    <Eye size={16} strokeWidth={1.5} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p id="reset-confirm-error" className="t-caption c-error mt-1.5" role="alert">
                  {errors.confirmPassword.message}
                </p>
              )}
              {passwordsMatch && !errors.confirmPassword && (
                <p className="t-caption c-success mt-1.5 inline-flex items-center gap-1">
                  <Check size={11} strokeWidth={2.5} />
                  Passwords match
                </p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isSubmitting}
            >
              {isSubmitting ? "Updating password…" : "Reset Password"}
              {!isSubmitting && (
                <ArrowRight
                  size={16}
                  strokeWidth={1.5}
                  className="transition-transform group-hover:translate-x-1"
                />
              )}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthShell>
  );
}

export default ResetPasswordView;

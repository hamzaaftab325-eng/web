"use client";

import * as React from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Mail, Check, ArrowRight, ArrowLeft, Inbox } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/aura/ui/Button";
import { cn } from "@/lib/utils";

import { AuthShell } from "./AuthShell";


/* ────────────────────────────────────────────────────────────────────────
   Schema — inline Zod
   ──────────────────────────────────────────────────────────────────────── */
const forgotSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

type ForgotValues = z.infer<typeof forgotSchema>;

/* ────────────────────────────────────────────────────────────────────────
   ForgotPasswordView
   ──────────────────────────────────────────────────────────────────────── */
export function ForgotPasswordView() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  const [submittedEmail, setSubmittedEmail] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotValues) => {
    // Always succeeds — never reveal whether an account exists.
    await new Promise<void>((resolve) => setTimeout(resolve, 700));
    setSubmittedEmail(values.email);
  };

  const goLogin = () => router.push("/login");

  const footer = (
    <p className="t-body c-ink-muted text-center">
      Remembered your password?{" "}
      <button
        type="button"
        onClick={goLogin}
        className="c-ink hover:c-gold-deep link-underline font-medium"
      >
        Back to sign in
      </button>
    </p>
  );

  return (
    <AuthShell
      eyebrow="Reset Password"
      title={
        submittedEmail ? (
          <>
            Check your{" "}
            <span className="t-italic-display c-gold-deep">inbox</span>.
          </>
        ) : (
          <>
            Forgot your{" "}
            <span className="t-italic-display c-gold-deep">password</span>?
          </>
        )
      }
      subtitle={
        submittedEmail
          ? "If an Aura account is associated with that address, a reset link is on its way."
          : "Enter the email tied to your Aura account and we'll send a secure link to reset your password."
      }
      footer={footer}
      backTo="login"
    >
      <AnimatePresence mode="wait">
        {submittedEmail ? (
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
                className="relative"
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

            {/* Confirmation card */}
            <div className="bg-gradient-card-warm border-hairline-cream p-5 shadow-card-modern">
              <div className="flex items-start gap-3">
                <Inbox
                  size={18}
                  strokeWidth={1.5}
                  className="c-gold-deep shrink-0 mt-0.5"
                />
                <div className="min-w-0">
                  <p className="t-body-sm c-ink mb-1">
                    Reset link sent to
                  </p>
                  <p className="t-body c-ink font-medium break-all">
                    {submittedEmail}
                  </p>
                  <p className="t-caption c-ink-faint mt-2">
                    The link is valid for 30 minutes. If you don't see the
                    email, check your spam folder or request a new link.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                type="button"
                variant="primary"
                size="lg"
                fullWidth
                onClick={goLogin}
              >
                <ArrowLeft size={16} strokeWidth={1.5} />
                Back to sign in
              </Button>
              <button
                type="button"
                onClick={() => setSubmittedEmail(null)}
                className="block mx-auto t-body-sm c-ink-muted hover:c-gold-deep link-underline"
              >
                Resend to a different email
              </button>
            </div>
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
            <div>
              <label
                htmlFor="forgot-email"
                className="t-label-caps c-ink-faint block mb-2"
              >
                Email address
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  strokeWidth={1.5}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 c-ink-faint pointer-events-none"
                />
                <input
                  id="forgot-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@studio.com"
                  aria-invalid={Boolean(errors.email) || undefined}
                  aria-describedby={errors.email ? "forgot-email-error" : "forgot-email-hint"}
                  className={cn(
                    "w-full bg-transparent border border-hairline pl-11 pr-4 py-3 t-body c-ink",
                    "placeholder:c-ink-faint focus:border-ink focus:outline-none transition-colors",
                    errors.email && "border-error focus:border-error"
                  )}
                  {...register("email")}
                />
              </div>
              {errors.email ? (
                <p id="forgot-email-error" className="t-caption c-error mt-1.5" role="alert">
                  {errors.email.message}
                </p>
              ) : (
                <p id="forgot-email-hint" className="t-caption c-ink-faint mt-1.5">
                  We'll send a one-time link — no password shared in email.
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
              {isSubmitting ? "Sending reset link…" : "Send Reset Link"}
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

export default ForgotPasswordView;

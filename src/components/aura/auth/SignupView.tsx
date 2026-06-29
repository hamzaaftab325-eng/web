"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, useReducedMotion } from "framer-motion";
import {
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Check,
  User,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { AuthShell } from "./AuthShell";
import { Button } from "@/components/aura/ui/Button";
import { useAuthStore } from "@/store/use-auth-store";
import { useUIStore } from "@/store/use-ui-store";
import { cn } from "@/lib/utils";
import { signUp as trackSignUp } from "@/lib/analytics/ecommerce";
import { useRouter } from "next/navigation";

/* ────────────────────────────────────────────────────────────────────────
   Schema — inline Zod
   ──────────────────────────────────────────────────────────────────────── */
const signupSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "First name is required")
      .max(60, "That name is a touch too long"),
    lastName: z
      .string()
      .min(1, "Last name is required")
      .max(60, "That name is a touch too long"),
    email: z.string().email("Enter a valid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[0-9]/, "Add at least one number")
      .regex(/[A-Z]/, "Add at least one uppercase letter")
      .regex(/[a-z]/, "Add at least one lowercase letter")
      .regex(/[^A-Za-z0-9]/, "Add at least one special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    joinNewsletter: z.boolean(),
    acceptTerms: z.boolean(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((d) => d.acceptTerms === true, {
    message: "Please accept the terms to continue",
    path: ["acceptTerms"],
  });

type SignupValues = z.infer<typeof signupSchema>;

/* ────────────────────────────────────────────────────────────────────────
   Strength meter helpers
   ──────────────────────────────────────────────────────────────────────── */
interface StrengthCheck {
  len: boolean;
  num: boolean;
  caseOk: boolean;
  special: boolean;
}

function evaluatePassword(pw: string): { score: 0 | 1 | 2 | 3 | 4; checks: StrengthCheck } {
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

/* ────────────────────────────────────────────────────────────────────────
   Custom checkbox (square)
   ──────────────────────────────────────────────────────────────────────── */
interface SquareToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  id?: string;
  invalid?: boolean;
}

function SquareToggle({ checked, onChange, label, id, invalid }: SquareToggleProps) {
  return (
    <button
      type="button"
      role="checkbox"
      id={id}
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "shrink-0 w-4 h-4 border flex items-center justify-center transition-colors duration-300",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
        checked
          ? "bg-ink border-ink"
          : invalid
            ? "bg-transparent border-error"
            : "bg-transparent border-hairline-strong hover:border-gold"
      )}
    >
      {checked && <Check size={11} strokeWidth={2.5} className="c-paper" />}
    </button>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   SignupView
   ──────────────────────────────────────────────────────────────────────── */
export function SignupView() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const setUser = useAuthStore((s) => s.setUser);
  const setToken = useAuthStore((s) => s.setToken);
  const setAuthRedirect = useUIStore((s) => s.setAuthRedirect);

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      joinNewsletter: true,
      acceptTerms: false,
    },
  });

  const passwordValue = useWatch({ control, name: "password" }) ?? "";
  const confirmPasswordValue = useWatch({ control, name: "confirmPassword" }) ?? "";
  const acceptTermsValue = useWatch({ control, name: "acceptTerms" }) ?? false;
  const joinNewsletterValue = useWatch({ control, name: "joinNewsletter" }) ?? true;
  const { score, checks } = evaluatePassword(passwordValue || "");
  const passwordsMatch =
    confirmPasswordValue.length > 0 && passwordValue === confirmPasswordValue;

  const onSubmit = async (values: SignupValues) => {
    setServerError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password,
          joinNewsletter: values.joinNewsletter,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? "Registration failed");
      }
      // Server sets aura_access + aura_refresh httpOnly cookies.
      // Also hydrate local store for UI state.
      setUser(data.user);
      setToken(data.token);

      // Fire analytics: sign_up
      trackSignUp({ method: "email" });

      // Redirect: admins go to /admin, customers go to /account
      const target = data.user?.role === "admin" ? "/admin" : "/account";
      setAuthRedirect(null);
      router.push(target);
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Registration failed");
    }
  };

  const goLogin = () => router.push("/login");

  const footer = (
    <p className="t-body c-ink-muted text-center">
      Already have an account?{" "}
      <button
        type="button"
        onClick={goLogin}
        className="c-ink hover:c-gold-deep link-underline font-medium"
      >
        Sign in
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
      eyebrow="Create Account"
      title={
        <>
          Join the{" "}
          <span className="t-italic-display c-gold-deep">Atelier</span>.
        </>
      }
      subtitle="Save pieces you love, check out faster, and follow each order from atelier to door."
      footer={footer}
      backTo="home"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {/* Hidden field registrations for the toggled booleans */}
        <input type="hidden" {...register("joinNewsletter")} />
        <input type="hidden" {...register("acceptTerms")} />

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

        {/* Name fields */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="signup-first" className="t-label-caps c-ink-faint block mb-2">
              First name
            </label>
            <div className="relative">
              <User
                size={16}
                strokeWidth={1.5}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 c-ink-faint pointer-events-none"
              />
              <input
                id="signup-first"
                type="text"
                autoComplete="given-name"
                aria-invalid={Boolean(errors.firstName) || undefined}
                aria-describedby={errors.firstName ? "signup-first-error" : undefined}
                className={cn(
                  "w-full bg-transparent border border-hairline pl-11 pr-3 py-3 t-body c-ink",
                  "placeholder:c-ink-faint focus:border-ink focus:outline-none transition-colors",
                  errors.firstName && "border-error focus:border-error"
                )}
                {...register("firstName")}
              />
            </div>
            {errors.firstName && (
              <p id="signup-first-error" className="t-caption c-error mt-1.5" role="alert">
                {errors.firstName.message}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="signup-last" className="t-label-caps c-ink-faint block mb-2">
              Last name
            </label>
            <input
              id="signup-last"
              type="text"
              autoComplete="family-name"
              aria-invalid={Boolean(errors.lastName) || undefined}
              aria-describedby={errors.lastName ? "signup-last-error" : undefined}
              className={cn(
                "w-full bg-transparent border border-hairline px-4 py-3 t-body c-ink",
                "placeholder:c-ink-faint focus:border-ink focus:outline-none transition-colors",
                errors.lastName && "border-error focus:border-error"
              )}
              {...register("lastName")}
            />
            {errors.lastName && (
              <p id="signup-last-error" className="t-caption c-error mt-1.5" role="alert">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label htmlFor="signup-email" className="t-label-caps c-ink-faint block mb-2">
            Email
          </label>
          <div className="relative">
            <Mail
              size={16}
              strokeWidth={1.5}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 c-ink-faint pointer-events-none"
            />
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              placeholder="you@studio.com"
              aria-invalid={Boolean(errors.email) || undefined}
              aria-describedby={errors.email ? "signup-email-error" : undefined}
              className={cn(
                "w-full bg-transparent border border-hairline pl-11 pr-4 py-3 t-body c-ink",
                "placeholder:c-ink-faint focus:border-ink focus:outline-none transition-colors",
                errors.email && "border-error focus:border-error"
              )}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p id="signup-email-error" className="t-caption c-error mt-1.5" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="signup-password" className="t-label-caps c-ink-faint block mb-2">
            Password
          </label>
          <div className="relative">
            <Lock
              size={16}
              strokeWidth={1.5}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 c-ink-faint pointer-events-none"
            />
            <input
              id="signup-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Create a password"
              aria-invalid={Boolean(errors.password) || undefined}
              aria-describedby={errors.password ? "signup-password-error" : "signup-password-strength"}
              className={cn(
                "w-full bg-transparent border border-hairline pl-11 pr-11 py-3 t-body c-ink",
                "placeholder:c-ink-faint focus:border-ink focus:outline-none transition-colors",
                errors.password && "border-error focus:border-error"
              )}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 c-ink-faint hover:c-gold-deep transition-colors p-1 -mr-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
            >
              {showPassword ? (
                <EyeOff size={16} strokeWidth={1.5} />
              ) : (
                <Eye size={16} strokeWidth={1.5} />
              )}
            </button>
          </div>

          {/* Strength meter */}
          <div id="signup-password-strength" className="mt-2.5">
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
                {passwordValue ? STRENGTH_LABEL[score] : "—"}
              </span>
            </div>

            {/* Requirements checklist */}
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

          {errors.password && (
            <p id="signup-password-error" className="t-caption c-error mt-1.5" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm password */}
        <div>
          <label htmlFor="signup-confirm" className="t-label-caps c-ink-faint block mb-2">
            Confirm password
          </label>
          <div className="relative">
            <Lock
              size={16}
              strokeWidth={1.5}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 c-ink-faint pointer-events-none"
            />
            <input
              id="signup-confirm"
              type={showConfirm ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Re-enter your password"
              aria-invalid={Boolean(errors.confirmPassword) || undefined}
              aria-describedby={errors.confirmPassword ? "signup-confirm-error" : undefined}
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
              className="absolute right-3 top-1/2 -translate-y-1/2 c-ink-faint hover:c-gold-deep transition-colors p-1 -mr-1"
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
            <p id="signup-confirm-error" className="t-caption c-error mt-1.5" role="alert">
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

        {/* Newsletter opt-in */}
        <label
          htmlFor="signup-newsletter"
          className="flex items-start gap-3 cursor-pointer group"
        >
          <SquareToggle
            id="signup-newsletter"
            checked={joinNewsletterValue}
            onChange={(v) =>
              setValue("joinNewsletter", v, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            label="Join the Aura newsletter for new arrivals and journal stories"
          />
          <span className="t-body-sm c-ink-muted group-hover:c-ink transition-colors">
            Send me new arrivals, atelier stories, and the occasional care tip.
          </span>
        </label>

        {/* Terms acceptance */}
        <div>
          <label
            htmlFor="signup-terms"
            className="flex items-start gap-3 cursor-pointer group"
          >
            <SquareToggle
              id="signup-terms"
              checked={acceptTermsValue}
              onChange={(v) =>
                setValue("acceptTerms", v, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              label="Accept the Aura Living terms and privacy policy"
              invalid={Boolean(errors.acceptTerms)}
            />
            <span className="t-body-sm c-ink-muted group-hover:c-ink transition-colors">
              I agree to the{" "}
              <a href="#" className="c-ink hover:c-gold-deep link-underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="c-ink hover:c-gold-deep link-underline">
                Privacy Policy
              </a>
              .
            </span>
          </label>
          {errors.acceptTerms && (
            <p className="t-caption c-error mt-1.5 ml-7" role="alert">
              {errors.acceptTerms.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating your account…" : "Create Account"}
          {!isSubmitting && (
            <ArrowRight size={16} strokeWidth={1.5} className="transition-transform group-hover:translate-x-1" />
          )}
        </Button>

        {/* Reassurance line */}
        <div className="flex items-center justify-center gap-2 pt-1">
          <ShieldCheck size={13} strokeWidth={1.5} className="c-gold-deep" />
          <span className="t-caption c-ink-faint">
            We never share your details. Unsubscribe anytime.
          </span>
        </div>
      </form>
    </AuthShell>
  );
}

export default SignupView;

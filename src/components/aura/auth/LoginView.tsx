"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, useReducedMotion } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { AuthShell } from "./AuthShell";
import { Button } from "@/components/aura/ui/Button";
import { useAuthStore } from "@/store/use-auth-store";
import { useUIStore } from "@/store/use-ui-store";
import { cn } from "@/lib/utils";
import { login as trackLogin } from "@/lib/analytics/ecommerce";
import { useRouter } from "next/navigation";

/* ────────────────────────────────────────────────────────────────────────
   Schema — inline Zod schema (no server-side dependency)
   ──────────────────────────────────────────────────────────────────────── */
const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;

/* ────────────────────────────────────────────────────────────────────────
   Inline brand SVGs for social login buttons
   ──────────────────────────────────────────────────────────────────────── */
function GoogleMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden focusable="false">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.836.86-3.048.86-2.344 0-4.328-1.584-5.036-3.71H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}

function AppleMark() {
  return (
    <svg width="14" height="16" viewBox="0 0 14 16" aria-hidden focusable="false" fill="currentColor">
      <path d="M11.068 8.475c-.018-1.858 1.52-2.75 1.588-2.794-.866-1.265-2.214-1.438-2.69-1.46-1.143-.116-2.232.673-2.812.673-.582 0-1.485-.656-2.443-.637-1.255.018-2.414.73-3.058 1.85-1.302 2.255-.333 5.594.934 7.424.617.895 1.353 1.9 2.31 1.864.93-.038 1.28-.6 2.404-.6 1.123 0 1.435.6 2.416.578 1.001-.018 1.626-.91 2.237-1.807.703-1.029.992-2.026 1.01-2.078-.022-.01-1.937-.742-1.956-2.942M9.248 2.82c.51-.617.855-1.473.762-2.326-.736.03-1.627.489-2.156 1.105-.473.547-.887 1.418-.776 2.253.822.064 1.66-.416 2.17-1.032" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   Custom sliding toggle for "Remember me"
   ──────────────────────────────────────────────────────────────────────── */
interface SlidingToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  id?: string;
}

function SlidingToggle({ checked, onChange, label, id }: SlidingToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
        checked ? "bg-ink" : "bg-cream-deep border border-hairline"
      )}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className={cn(
          "inline-block h-3.5 w-3.5 rounded-full bg-paper shadow-ambient",
          checked ? "ml-auto mr-1" : "ml-1"
        )}
      />
    </button>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   LoginView
   ──────────────────────────────────────────────────────────────────────── */
export function LoginView() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const setUser = useAuthStore((s) => s.setUser);
  const setToken = useAuthStore((s) => s.setToken);
  const authRedirect = useUIStore((s) => s.authRedirect);
  const setAuthRedirect = useUIStore((s) => s.setAuthRedirect);

  const [showPassword, setShowPassword] = React.useState(false);
  const [remember, setRemember] = React.useState(true);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (values: LoginValues) => {
    setServerError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email, password: values.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? "Sign in failed");
      }
      // Server sets aura_access + aura_refresh httpOnly cookies.
      // Also hydrate local store for UI state.
      setUser(data.user);
      setToken(data.token);

      // Fire analytics: login
      trackLogin({ method: "email" });

      // Redirect: if there's a saved auth redirect, use it.
      // Otherwise, admins go to /admin, customers go to /.
      const target = authRedirect ?? (data.user?.role === "admin" ? "/admin" : "/");
      setAuthRedirect(null);
      router.push(target);
    } catch (e) {
      setServerError(e instanceof Error ? e.message : "Sign in failed");
    }
  };

  const goSignup = () => router.push("/signup");
  const goForgot = () => router.push("/forgot-password");

  const footer = (
    <p className="t-body c-ink-muted text-center">
      New to Aura?{" "}
      <button
        type="button"
        onClick={goSignup}
        className="c-ink hover:c-gold-deep link-underline font-medium"
      >
        Create an account
      </button>
    </p>
  );

  return (
    <AuthShell
      eyebrow="Sign In"
      title={
        <>
          Welcome back to{" "}
          <span className="t-italic-display c-gold-deep">Aura</span>.
        </>
      }
      subtitle="Sign in to track orders, save your wishlist, and check out faster."
      footer={footer}
      backTo="home"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {/* Server / form-level error */}
        {serverError && (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2.5 bg-error/5 border border-error/25 px-3.5 py-3"
            role="alert"
          >
            <AlertCircle
              size={15}
              strokeWidth={1.75}
              className="c-error shrink-0 mt-0.5"
            />
            <p className="t-body-sm c-error">{serverError}</p>
          </motion.div>
        )}

        {/* Email */}
        <div>
          <label
            htmlFor="login-email"
            className="t-label-caps c-ink-faint block mb-2"
          >
            Email
          </label>
          <div className="relative">
            <Mail
              size={16}
              strokeWidth={1.5}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 c-ink-faint pointer-events-none"
            />
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="you@studio.com"
              aria-invalid={Boolean(errors.email) || undefined}
              aria-describedby={errors.email ? "login-email-error" : undefined}
              className={cn(
                "w-full bg-transparent border border-hairline pl-11 pr-4 py-3 t-body c-ink",
                "placeholder:c-ink-faint focus:border-ink focus:outline-none transition-colors",
                errors.email && "border-error focus:border-error"
              )}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p id="login-email-error" className="t-caption c-error mt-1.5" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="login-password"
            className="t-label-caps c-ink-faint block mb-2"
          >
            Password
          </label>
          <div className="relative">
            <Lock
              size={16}
              strokeWidth={1.5}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 c-ink-faint pointer-events-none"
            />
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              aria-invalid={Boolean(errors.password) || undefined}
              aria-describedby={
                errors.password ? "login-password-error" : undefined
              }
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
          {errors.password && (
            <p
              id="login-password-error"
              className="t-caption c-error mt-1.5"
              role="alert"
            >
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember + forgot */}
        <div className="flex items-center justify-between">
          <label
            htmlFor="login-remember"
            className="inline-flex items-center gap-2.5 cursor-pointer group"
          >
            <SlidingToggle
              id="login-remember"
              checked={remember}
              onChange={setRemember}
              label="Remember me on this device"
            />
            <span className="t-body-sm c-ink-muted group-hover:c-ink transition-colors">
              Remember me
            </span>
          </label>
          <button
            type="button"
            onClick={goForgot}
            className="t-body-sm c-ink-muted hover:c-gold-deep link-underline"
          >
            Forgot password?
          </button>
        </div>

        {/* Primary submit */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in…" : "Sign In"}
          {!isSubmitting && (
            <ArrowRight size={16} strokeWidth={1.5} className="transition-transform group-hover:translate-x-1" />
          )}
        </Button>

        {/* Divider */}
        <div className="divider-animated my-2" />

        {/* Social */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            size="md"
            disabled
            aria-label="Continue with Google (coming soon)"
          >
            <GoogleMark />
            Google
          </Button>
          <Button
            type="button"
            variant="outline"
            size="md"
            disabled
            aria-label="Continue with Apple (coming soon)"
          >
            <AppleMark />
            Apple
          </Button>
        </div>
        <p className="t-caption c-ink-faint text-center -mt-2">
          Social sign-in coming soon
        </p>
      </form>
    </AuthShell>
  );
}

export default LoginView;

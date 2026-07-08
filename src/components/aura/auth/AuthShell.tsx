"use client";

import * as React from "react";

import { useRouter } from "next/navigation";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { TextBlurReveal } from "@/components/aura/animation/TextBlurReveal";
import { cn } from "@/lib/utils";

type BackTarget = "home" | "login";

export interface AuthShellProps {
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  backTo?: BackTarget;
  heroImage?: string;
  quote?: {
    text: string;
    attribution: string;
  };
  className?: string;
}

const DEFAULT_QUOTE = {
  text: "Aura objects arrive like small inheritances — quietly improving the rooms they enter, year after year.",
  attribution: "Maren Holt, Founder",
};

const TRUST_SIGNALS = ["Secure checkout", "30-day returns", "Lifetime care"];

/**
 * AuthShell — split-screen shell for login, signup, and password flows.
 *
 * The left column hosts the form panel on a warm gradient with animated orbs
 * and noise; the right column shows a hero image with a glassmorphic quote
 * card pinned to the bottom (desktop only). Trust signals live at the foot
 * of the form column so they're always in view while typing.
 */
export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
  backTo = "home",
  heroImage = "/hero/slide-1.webp",
  quote = DEFAULT_QUOTE,
  className,
}: AuthShellProps) {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  const goBack = () => {
    if (backTo === "login") router.push("/login");
    else router.push("/");
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.08, delayChildren: 0.05 },
    },
  };
  const itemVariants = prefersReducedMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 12 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
        },
      };

  return (
    <section
      className={cn("min-h-screen w-full grid lg:grid-cols-2 bg-canvas safe-area-top", className)}
      aria-labelledby="auth-shell-title"
    >
      {/* ── Left: form column ─────────────────────────────────────────── */}
      <div className="relative flex flex-col min-h-screen bg-gradient-to-br from-canvas via-cream to-cream-deep orb-bg noise-texture">
        {/* Top bar — back + logo (safe-area-top handled by parent section) */}
        <div className="relative z-10 flex items-center justify-between px-5 sm:px-6 md:px-10 pt-4 sm:pt-6 md:pt-8">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-2 t-label-caps c-ink-muted hover:c-gold-deep transition-colors link-underline py-2 -my-2"
          >
            <ArrowLeft size={14} strokeWidth={1.5} />
            <span className="hidden sm:inline">{backTo === "login" ? "Back to login" : "Back to home"}</span>
          </button>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex items-baseline gap-1.5 group"
            aria-label="Aura Living home"
          >
            <span className="t-headline-md font-display c-ink leading-none">
              Aura
            </span>
            <span className="t-label-caps c-gold-deep hidden sm:inline-block">
              Living
            </span>
          </button>
        </div>

        {/* Form panel — vertically centered, capped width */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 flex-1 flex flex-col justify-center px-5 sm:px-6 md:px-10 py-8 sm:py-12 md:py-16 overflow-y-auto"
        >
          <div className="w-full max-w-[440px] mx-auto">
            <motion.div variants={itemVariants}>
              <p className="t-label-caps c-gold-deep mb-4 flex items-center gap-2">
                <span className="w-6 h-px bg-gold" aria-hidden />
                {eyebrow}
              </p>
            </motion.div>

            <motion.div variants={itemVariants}>
              <TextBlurReveal
                as="h1"
                id="auth-shell-title"
                trigger="mount"
                duration={0.9}
                className="t-display-md c-ink leading-[1.1] mb-4"
              >
                {title}
              </TextBlurReveal>
            </motion.div>

            {subtitle && (
              <motion.div variants={itemVariants}>
                <p className="t-body-lg c-ink-muted mb-8 md:mb-10 leading-relaxed">
                  {subtitle}
                </p>
              </motion.div>
            )}

            <motion.div variants={itemVariants} className="mb-8">
              {children}
            </motion.div>

            {footer && (
              <motion.div variants={itemVariants} className="mt-6">
                {footer}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Trust signals — bottom of left column */}
        <div className="relative z-10 px-5 sm:px-6 md:px-10 pb-4 sm:pb-6 md:pb-8 safe-area-bottom">
          <div className="max-w-[440px] mx-auto flex items-center justify-center gap-3 md:gap-4 flex-wrap">
            {TRUST_SIGNALS.map((signal, i) => (
              <React.Fragment key={signal}>
                {i > 0 && (
                  <span className="w-1 h-1 rounded-full bg-ink-faint/40" aria-hidden />
                )}
                <span className="inline-flex items-center gap-1.5 t-caption c-ink-faint">
                  <ShieldCheck
                    size={12}
                    strokeWidth={1.5}
                    className="c-gold-deep"
                  />
                  {signal}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right: hero column (desktop only) ─────────────────────────── */}
      <aside className="hidden lg:block relative overflow-hidden bg-ink">
        {/* Hero image */}
        <img
          src={heroImage}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Layered overlays for depth + legibility */}
        <div className="absolute inset-0 hero-overlay" aria-hidden />
        <div className="absolute inset-0 hero-overlay-bias" aria-hidden />

        {/* Top eyebrow */}
        <div className="relative z-10 h-full flex flex-col justify-end p-12 xl:p-16">
          <div className="max-w-md ml-auto">
            <div className="glass-card-dark p-8 xl:p-10 shadow-premium">
              <p className="t-italic-display c-paper text-[1.5rem] xl:text-[1.75rem] leading-[1.35] mb-5">
                &ldquo;{quote.text}&rdquo;
              </p>
              <div className="flex items-center gap-3">
                <span className="w-8 h-px bg-gold" aria-hidden />
                <span className="t-label-caps c-gold-soft">{quote.attribution}</span>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-end gap-3">
              <span className="t-label-caps c-paper/60">Aura Living Atelier</span>
              <span className="w-6 h-px bg-paper/30" aria-hidden />
            </div>
          </div>
        </div>
      </aside>
    </section>
  );
}

export default AuthShell;

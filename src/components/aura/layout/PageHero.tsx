"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * PageHero — full-bleed editorial hero for inner pages.
 *
 * Renders a tall image hero (60vh, min 480px) with a dark gradient
 * overlay, eyebrow label, headline, and optional subtitle/CTA slot.
 * Sits under the fixed Header (no top padding on the parent view)
 * so the image extends to the top of the viewport, matching the
 * home HeroSlider pattern.
 *
 * Uses only existing design-system classes — no new tokens.
 * Honors prefers-reduced-motion.
 */

export interface PageHeroProps {
  /** Hero image URL (use /hero/<name>.png). */
  image: string;
  /** Alt text for the image — required for accessibility. */
  alt: string;
  /** Small caps label above the headline (e.g. "Collections"). */
  eyebrow: string;
  /** The display headline. Rendered as h1. */
  headline: string;
  /** Optional body subtitle below the headline. */
  subtitle?: string;
  /** Optional slot for CTA buttons / links. */
  children?: ReactNode;
}

export function PageHero({
  image,
  alt,
  eyebrow,
  headline,
  subtitle,
  children,
}: PageHeroProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      className="relative h-[60vh] min-h-[480px] w-full overflow-hidden bg-ink flex items-end"
      aria-label={eyebrow}
    >
      <motion.img
        src={image}
        alt={alt}
        initial={prefersReducedMotion ? false : { scale: 1.05 }}
        animate={prefersReducedMotion ? { scale: 1 } : { scale: 1 }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 w-full h-full object-cover opacity-70"
      />
      {/* Dark gradient overlay so header text + headline remain legible */}
      <div className="absolute inset-0 hero-overlay" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/30 to-transparent" />

      <div className="relative z-10 container-aura pb-16 md:pb-24 w-full">
        <motion.p
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="t-label-caps c-gold mb-5 flex items-center gap-2"
        >
          <span className="w-6 h-px bg-gold" aria-hidden />
          {eyebrow}
        </motion.p>

        <motion.h1
          initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="t-display-xl c-paper leading-[1.05] max-w-3xl mb-6"
        >
          {headline}
        </motion.h1>

        {subtitle && (
          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="t-body-lg c-paper/80 max-w-xl leading-relaxed mb-8"
          >
            {subtitle}
          </motion.p>
        )}

        {children && (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        )}
      </div>
    </section>
  );
}

export default PageHero;

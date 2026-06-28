"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * PageHero — full-bleed editorial hero for inner pages.
 *
 * Renders a tall image hero (60vh, min 480px) with a dark gradient
 * overlay, a small eyebrow label, and a single short headline.
 * Sits under the fixed Header (no top padding on the parent view)
 * so the image extends to the top of the viewport, matching the
 * home HeroSlider pattern.
 *
 * Design constraint: heading only — no subtitle paragraph, no CTA
 * buttons. The eyebrow is a short uppercase label; the headline is
 * a short phrase (2-4 words). Both render in white over the image.
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
  /** Short display headline (2-4 words). Rendered as h1. */
  headline: string;
}

export function PageHero({
  image,
  alt,
  eyebrow,
  headline,
}: PageHeroProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      className="relative h-[60vh] min-h-[480px] w-full overflow-hidden flex items-end hero-bg"
      aria-label={eyebrow}
    >
      <motion.img
        src={image}
        alt={alt}
        initial={prefersReducedMotion ? false : { scale: 1.05 }}
        animate={prefersReducedMotion ? { scale: 1 } : { scale: 1 }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Dark gradient overlays — hardcoded black so they work in both
          light AND dark mode (theme-independent). This ensures the white
          heading text is always legible over the image. */}
      <div className="absolute inset-0 hero-overlay" />
      <div className="absolute inset-0 hero-overlay-bias" />

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
          className="t-display-xl hero-text leading-[1.05] max-w-3xl"
        >
          {headline}
        </motion.h1>
      </div>
    </section>
  );
}

export default PageHero;

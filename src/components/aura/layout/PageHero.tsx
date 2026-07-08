"use client";

import { useRef, useState, useEffect } from "react";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/**
 * PageHero — full-bleed editorial hero for inner pages.
 *
 * Renders a tall image hero (60vh, min 480px) with a dark gradient
 * overlay, a small eyebrow label, and a single short headline.
 * Sits under the fixed Header (no top padding on the parent view)
 * so the image extends to the top of the viewport, matching the
 * home HeroSlider pattern.
 *
 * Animation — Scale + Fade parallax (2026 standard):
 *   - Background image scales from 1.10 → 1.30 as user scrolls past
 *   - Content (eyebrow + headline) translates up at 20% scroll speed
 *     and fades out near the end of the hero
 *   - Implemented with Framer Motion's useScroll + useTransform —
 *     rAF-throttled, GPU-accelerated, zero layout thrash
 *   - Disabled on mobile (≤768px) and prefers-reduced-motion for
 *     maximum performance and accessibility
 *
 * Design constraint: heading only — no subtitle paragraph, no CTA
 * buttons. The eyebrow is a short uppercase label; the headline is
 * a short phrase (2-4 words). Both render in white over the image.
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

  // Ref for scoping scroll progress to this hero section
  const sectionRef = useRef<HTMLElement>(null);

  // Detect mobile — disable parallax on small screens for performance
  // (mobile scroll performance + small viewport = parallax adds no value)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Should we run the parallax at all?
  const enableParallax = !prefersReducedMotion && !isMobile;

  // Scroll progress of this hero through the viewport:
  // 0 = hero at rest (fills viewport)
  // 1 = hero has fully scrolled past
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  // Scale + Fade transforms — only attached when enableParallax is true.
  // - Image scales 1.10 → 1.30 (slow zoom-in)
  // - Content translates up 0 → -160px (drifts up faster than scroll)
  // - Content fades 1 → 0.6 → 0 (holds until 60%, then fades to exit)
  const scale = useTransform(scrollYProgress, [0, 1], [1.10, 1.30]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -160]);
  const contentOpacity = useTransform(
    scrollYProgress,
    [0, 0.6, 1],
    [1, 0.6, 0]
  );

  return (
    <section
      ref={sectionRef}
      className="relative h-[60vh] min-h-[480px] w-full overflow-hidden flex items-end hero-bg"
      aria-label={eyebrow}
    >
      <motion.img
        src={image}
        alt={alt}
        // Mount-time entrance scale (1.05 → 1.10) — runs once on load
        initial={prefersReducedMotion ? false : { scale: 1.05 }}
        animate={prefersReducedMotion ? { scale: 1 } : { scale: 1.10 }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        // Scroll-driven scale (1.10 → 1.30) — only attached when parallax enabled.
        // Note: when enableParallax is false, style is undefined and the mount
        // scale (1.10) from `animate` is the final value — clean fallback.
        style={
          enableParallax
            ? { scale, willChange: "transform" }
            : undefined
        }
        className="absolute inset-0 w-full h-full object-cover"
        fetchPriority="high"
      />
      {/* Dark gradient overlays — hardcoded black so they work in both
          light AND dark mode (theme-independent). This ensures the white
          heading text is always legible over the image. */}
      <div className="absolute inset-0 hero-overlay" />
      <div className="absolute inset-0 hero-overlay-bias" />

      <motion.div
        className="relative z-10 container-aura pb-16 md:pb-24 w-full"
        style={
          enableParallax
            ? {
                y: contentY,
                opacity: contentOpacity,
                willChange: "transform, opacity",
              }
            : undefined
        }
      >
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
      </motion.div>
    </section>
  );
}

export default PageHero;

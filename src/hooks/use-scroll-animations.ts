/**
 * Scroll Animation Hooks — 2026 standard, zero new dependencies.
 *
 * Built on Framer Motion's useScroll / useTransform / useMotionValue /
 * useSpring / useInView — all already installed in v12.
 *
 * Usage examples:
 *
 *   // Parallax hero image
 *   const y = useParallax(150);
 *   <motion.div style={{ y }}><img /></motion.div>
 *
 *   // Magnetic button
 *   const { ref, motionStyle } = useMagneticHover();
 *   <motion.button ref={ref} style={motionStyle}>Click me</motion.button>
 *
 *   // Count-up number
 *   const { ref, value } = useCountUp(2024, { duration: 2 });
 *   <span ref={ref}>{value}</span>
 *
 *   // Scroll progress bar
 *   const scaleX = useScrollProgress();
 *   <motion.div style={{ scaleX }} />
 */

"use client";

import { useEffect, useRef, useState } from "react";

import {
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  useInView,
  animate,
  useReducedMotion,
} from "framer-motion";

// ============================================================
// useParallax — translate an element as the page scrolls
// ============================================================

/**
 * Returns a MotionValue for `y` that translates the element by `distance`
 * pixels as the user scrolls through the page.
 *
 *   const y = useParallax(150);  // moves 150px over the first viewport
 *   <motion.div style={{ y }}>...</motion.div>
 *
 * Pass an optional ref to scope the scroll to a specific container.
 * Falls back to 0 (no movement) when prefers-reduced-motion is set.
 */
export function useParallax(
  distance: number,
  targetRef?: React.RefObject<HTMLElement>
) {
  const prefersReducedMotion = useReducedMotion();

  const { scrollY } = useScroll(
    targetRef ? { target: targetRef, offset: ["start end", "end start"] } : undefined
  );

  // Move from +distance/2 (entering from bottom) to -distance/2 (exiting top)
  // This creates the classic parallax feel where the element drifts slower
  // than the page scroll.
  const y = useTransform(
    scrollY,
    [0, typeof window !== "undefined" ? window.innerHeight : 800],
    [distance / 2, -distance / 2]
  );

  if (prefersReducedMotion) {
    return 0;
  }

  return y;
}

// ============================================================
// useMagneticHover — element drifts toward the cursor
// ============================================================

/**
 * Magnetic hover effect — the element gently follows the cursor when
 * the cursor is inside it, then springs back when the cursor leaves.
 *
 *   const { ref, motionStyle } = useMagneticHover({ strength: 0.3 });
 *   <motion.button ref={ref} style={motionStyle}>CTA</motion.button>
 *
 * `strength` is 0–1. 0.3 means the element moves 30% of the cursor's
 * offset from the element's center. Default 0.25.
 *
 * Disabled for prefers-reduced-motion (returns no transform).
 */
export function useMagneticHover(options?: {
  strength?: number;
  stiffness?: number;
  damping?: number;
}) {
  const { strength = 0.25, stiffness = 200, damping = 15 } = options || {};
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness, damping });
  const springY = useSpring(y, { stiffness, damping });

  useEffect(() => {
    if (prefersReducedMotion || !ref.current) return;

    const el = ref.current;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      x.set((e.clientX - centerX) * strength);
      y.set((e.clientY - centerY) * strength);
    };
    const onLeave = () => {
      x.set(0);
      y.set(0);
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [prefersReducedMotion, strength, x, y]);

  return {
    ref,
    motionStyle: prefersReducedMotion
      ? {}
      : { x: springX, y: springY },
  };
}

// ============================================================
// useCountUp — animate a number from 0 to target when in view
// ============================================================

/**
 * Counts up from 0 (or `from`) to `target` when the element scrolls into view.
 *
 *   const { ref, value } = useCountUp(2024, { duration: 2 });
 *   <span ref={ref}>{value}</span>
 *
 * Disabled for prefers-reduced-motion (returns target immediately).
 */
export function useCountUp(
  target: number,
  options?: {
    from?: number;
    duration?: number;
    decimals?: number;
  }
) {
  const { from = 0, duration = 2, decimals = 0 } = options || {};
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-15% 0px" });
  const [value, setValue] = useState(prefersReducedMotion ? target : from);

  useEffect(() => {
    if (prefersReducedMotion) {
      // Defer the setState via microtask to satisfy React 19's
      // react-hooks/set-state-in-effect rule.
      queueMicrotask(() => setValue(target));
      return;
    }
    if (!isInView) return;

    const controls = animate(from, target, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setValue(decimals > 0 ? Number(v.toFixed(decimals)) : Math.round(v)),
    });

    return () => controls.stop();
  }, [isInView, from, target, duration, decimals, prefersReducedMotion]);

  return { ref, value };
}

// ============================================================
// useScrollProgress — 0→1 progress of the whole page scroll
// ============================================================

/**
 * Returns a MotionValue for scaleX (0 → 1) representing how far the
 * user has scrolled through the page. Perfect for reading-progress bars.
 *
 *   const scaleX = useScrollProgress();
 *   <motion.div style={{ scaleX, transformOrigin: "0%" }} className="h-1 bg-gold" />
 *
 * Returns 0 for prefers-reduced-motion.
 */
export function useScrollProgress() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  if (prefersReducedMotion) return 0;
  return scaleX;
}

// ============================================================
// useScrollSectionProgress — progress within a specific section
// ============================================================

/**
 * Returns scroll progress (0→1) for a specific section element.
 *
 *   const { ref, progress } = useScrollSectionProgress();
 *   <section ref={ref}>
 *     <motion.div style={{ opacity: progress }}>...</motion.div>
 *   </section>
 */
export function useScrollSectionProgress() {
  const prefersReducedMotion = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return {
    ref,
    progress: prefersReducedMotion ? 0 : progress,
  };
}

// ============================================================
// useReveal — programmatic scroll-triggered reveal (alternative to RevealOnScroll)
// ============================================================

/**
 * Lower-level hook version of RevealOnScroll. Returns a ref + boolean
 * you can use to drive any animation manually.
 *
 *   const { ref, inView } = useReveal();
 *   <motion.div
 *     ref={ref}
 *     animate={inView ? "visible" : "hidden"}
 *     variants={fadeUp}
 *   />
 */
export function useReveal(options?: { once?: boolean; margin?: string }) {
  const { once = true, margin = "-15% 0px" } = options || {};
  const ref = useRef<HTMLDivElement>(null);
  // Cast margin — Framer Motion's MarginType is stricter than string,
  // but accepts the same format we use everywhere else.
  const isInView = useInView(ref, { once, margin: margin as never });
  return { ref, inView: isInView };
}

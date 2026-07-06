/**
 * Animation Variants & Constants — single source of truth for the
 * Aura Living animation system.
 *
 * Usage:
 *   import { EASE_PREMIUM, fadeUp, staggerParent } from "@/lib/animation-variants";
 *
 * Everything here uses the gold-standard easing curve [0.16, 1, 0.3, 1]
 * — the same one used in MobileNav, RevealOnScroll, and all drawers.
 *
 * 2026 standard: zero new dependencies. These are pure Framer Motion
 * variants that work with the already-installed v12.
 */

import type { Transition, Variants } from "framer-motion";

// ============================================================
// Easing curves
// ============================================================

/** Premium ease-out — used for 95% of animations. iOS/Material feel. */
export const EASE_PREMIUM = [0.16, 1, 0.3, 1] as const;

/** Spring bounce — used for playful pops (wishlist heart, add-to-cart badge). */
export const EASE_SPRING_BOUNCE = [0.34, 1.56, 0.64, 1] as const;

/** Linear — only for spinners and continuous rotations. */
export const EASE_LINEAR = "linear" as const;

// ============================================================
// Durations (seconds)
// ============================================================

export const DURATION = {
  fast: 0.3,        // hovers, taps, small UI feedback
  base: 0.4,        // modals, popovers, small panel transitions
  slow: 0.5,        // drawer slides, page transitions
  reveal: 0.8,      // scroll-triggered reveals
  hero: 1.4,        // hero cross-fades, ken burns
} as const;

// ============================================================
// Standard transitions
// ============================================================

/** Default transition — use everywhere unless you have a specific reason not to. */
export const transitionStandard: Transition = {
  duration: DURATION.base,
  ease: EASE_PREMIUM,
};

/** Drawer slide transition (slower, same ease). */
export const transitionDrawer: Transition = {
  duration: DURATION.slow,
  ease: EASE_PREMIUM,
};

/** Scroll reveal transition (slowest, for sections entering viewport). */
export const transitionReveal: Transition = {
  duration: DURATION.reveal,
  ease: EASE_PREMIUM,
};

// ============================================================
// Stagger presets
// ============================================================

/** Standard stagger — for nav items, list items, card grids. */
export const STAGGER_STANDARD = {
  staggerChildren: 0.05,
  delayChildren: 0.12,
};

/** Fast stagger — for chips, tags, small UI lists. */
export const STAGGER_FAST = {
  staggerChildren: 0.03,
  delayChildren: 0.05,
};

/** Slow stagger — for hero text reveals, big editorial moments. */
export const STAGGER_SLOW = {
  staggerChildren: 0.1,
  delayChildren: 0.3,
};

// ============================================================
// Variants — use these inside motion components
// ============================================================

/** Fade up — the most common reveal. Use for sections, cards, headings. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitionReveal,
  },
};

/** Fade in — opacity only. Use when y-movement would feel wrong. */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: transitionStandard,
  },
};

/** Fade + scale — for modals, popovers, centered overlays. */
export const fadeScale: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitionStandard,
  },
};

/** Fade + scale + y — for modals with depth (QuickView, ExitIntent). */
export const fadeScaleY: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: transitionStandard,
  },
};

/** Slide from right — for right-side drawers (Cart, Wishlist, MobileNav). */
export const slideFromRight: Variants = {
  hidden: { opacity: 0, x: "100%" },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitionDrawer,
  },
  exit: {
    opacity: 0,
    x: "100%",
    transition: transitionDrawer,
  },
};

/** Slide from left — for left-side drawers (filters, compare). */
export const slideFromLeft: Variants = {
  hidden: { opacity: 0, x: "-100%" },
  visible: {
    opacity: 1,
    x: 0,
    transition: transitionDrawer,
  },
  exit: {
    opacity: 0,
    x: "-100%",
    transition: transitionDrawer,
  },
};

/** Slide from top — for top-anchored overlays (SearchOverlay). */
export const slideFromTop: Variants = {
  hidden: { opacity: 0, y: -30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitionStandard,
  },
  exit: {
    opacity: 0,
    y: -30,
    transition: transitionStandard,
  },
};

/** Stagger parent — wraps a list of children to stagger their entrance. */
export const staggerParent = (preset = STAGGER_STANDARD): Variants => ({
  hidden: {},
  visible: {
    transition: preset,
  },
});

/** Stagger child — pair with staggerParent. */
export const staggerChild: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitionStandard,
  },
};

/** List item (smaller y-offset, faster) — for search results, nav items. */
export const listItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.fast, ease: EASE_PREMIUM },
  },
};

// ============================================================
// Reduced-motion variants — use when gating with useReducedMotion
// ============================================================

/** Opacity-only versions of all variants — for reduced-motion users. */
export const reducedMotionVariants = {
  fadeUp: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
  fadeIn: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
  fadeScale: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
  fadeScaleY: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
  slideFromRight: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
  slideFromLeft: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
  slideFromTop: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
  listItem: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
};

// ============================================================
// Helpers
// ============================================================

/**
 * Returns the appropriate variant based on prefers-reduced-motion.
 *
 *   const variant = useMotionVariant(fadeUp, reducedMotionVariants.fadeUp);
 */
export function useMotionVariant<T extends Variants>(
  normal: T,
  reduced: T,
  prefersReducedMotion: boolean | null
): T {
  return prefersReducedMotion ? reduced : normal;
}

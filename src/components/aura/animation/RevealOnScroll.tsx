"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right" | "none" | "scale" | "blur";

interface RevealOnScrollProps {
  children: ReactNode;
  direction?: Direction;
  distance?: number;
  duration?: number;
  delay?: number;
  stagger?: number;
  blur?: boolean;
  once?: boolean;
  start?: string;
  className?: string;
  // Phase 5D: Removed dead 'as?: keyof typeof motion' prop — declared but never read.
}

const directionToOffset = (dir: Direction, dist: number) => {
  switch (dir) {
    case "up":    return { y: dist };
    case "down":  return { y: -dist };
    case "left":  return { x: dist };
    case "right": return { x: -dist };
    case "scale": return { scale: 0.96 };
    case "blur":  return { y: 12 };
    case "none":
    default:      return {};
  }
};

/**
 * RevealOnScroll — Framer Motion wrapper that animates children into view
 * as they enter the viewport. Honors prefers-reduced-motion.
 */
export function RevealOnScroll({
  children,
  direction = "up",
  distance = 30,
  duration = 0.8,
  delay = 0,
  stagger = 0,
  blur = false,
  once = true,
  start = "top 85%",
  className,
}: RevealOnScrollProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const offset = directionToOffset(direction, distance);
  const initial = blur
    ? { opacity: 0, filter: "blur(8px)", ...offset }
    : { opacity: 0, ...offset };

  if (stagger > 0) {
    return (
      <motion.div
        className={className}
        initial="hidden"
        whileInView="visible"
        viewport={{ once, margin: `-${start.includes("85") ? "15%" : "10%"} 0px` }}
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: stagger, delayChildren: delay },
          },
        }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" }}
      viewport={{ once, margin: "-15% 0px" }}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Child variant used inside a staggered RevealOnScroll parent. */
export const revealChild = (distance = 30, blur = false) => ({
  hidden: blur
    ? { opacity: 0, filter: "blur(8px)", y: distance }
    : { opacity: 0, y: distance },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  },
});

export default RevealOnScroll;

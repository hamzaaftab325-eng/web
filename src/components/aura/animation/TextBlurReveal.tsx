"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TextBlurRevealProps {
  children: ReactNode;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
  className?: string;
  duration?: number;
  delay?: number;
  trigger?: "scroll" | "mount";
  start?: string;
}

/**
 * TextBlurReveal — text starts blurred and slightly offset; animates into focus.
 * Honors prefers-reduced-motion.
 */
export function TextBlurReveal({
  children,
  as = "h2",
  className,
  duration = 0.9,
  delay = 0,
  trigger = "scroll",
  start = "top 85%",
}: TextBlurRevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const MotionTag = motion[as];

  if (prefersReducedMotion) {
    const Tag = as as keyof JSX.IntrinsicElements;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={cn(className)}
      initial={{ opacity: 0, filter: "blur(10px)", y: 14 }}
      {...(trigger === "scroll"
        ? { whileInView: { opacity: 1, filter: "blur(0px)", y: 0 }, viewport: { once: true, margin: "-15% 0px" } }
        : { animate: { opacity: 1, filter: "blur(0px)", y: 0 } })}
      transition={{ duration, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </MotionTag>
  );
}

export default TextBlurReveal;

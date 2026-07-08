"use client";

import { type ElementType } from "react";

import { motion, useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

interface SplitTextRevealProps {
  text: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
  className?: string;
  splitBy?: "char" | "word" | "line";
  stagger?: number;
  duration?: number;
  delay?: number;
  trigger?: "scroll" | "mount";
  start?: string;
}

/**
 * SplitTextReveal — splits text into chars/words/lines and animates them
 * upward from a clipped container. Honors prefers-reduced-motion.
 * ZERO inline styles — uses CSS utility classes only.
 */
export function SplitTextReveal({
  text,
  as = "h2",
  className,
  splitBy = "line",
  stagger = 0.08,
  duration = 0.8,
  delay = 0,
  trigger = "scroll",
}: SplitTextRevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const MotionTag = motion[as];

  if (prefersReducedMotion) {
    const Tag = as as ElementType;
    return <Tag className={className}>{text}</Tag>;
  }

  let units: string[] = [];
  if (splitBy === "line") {
    units = text.split("\n");
    if (units.length === 1) units = text.split(/(?<=[.!?])\s+/);
  } else if (splitBy === "word") {
    units = text.split(" ");
  } else {
    units = text.split("");
  }

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
  };

  const unitVariants = {
    hidden: { y: "110%" },
    visible: { y: "0%", transition: { duration, ease: [0.16, 1, 0.3, 1] as const } },
  };

  const maskClass =
    splitBy === "line" ? "block overflow-hidden" : "inline-block overflow-hidden align-bottom mr-[0.25em]";

  return (
    <MotionTag
      className={cn("block", className)}
      initial="hidden"
      {...(trigger === "scroll"
        ? { whileInView: "visible", viewport: { once: true, margin: "-15% 0px" } }
        : { animate: "visible" })}
      variants={containerVariants}
    >
      {units.map((unit, i) => (
        <span key={i} className={maskClass}>
          <motion.span className="inline-block" variants={unitVariants}>
            {unit}
            {splitBy === "word" && i < units.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}

export default SplitTextReveal;

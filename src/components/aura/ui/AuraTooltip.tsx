"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * AuraTooltip — gold-accent tooltip that appears on hover/focus.
 *
 * Props:
 * - content: tooltip text (string or ReactNode)
 * - side: "top" | "bottom" | "left" | "right" (default: "top")
 * - children: the trigger element
 *
 * Accessible: shows on focus + hover, dismisses on blur/escape.
 * Honors prefers-reduced-motion.
 */

export interface AuraTooltipProps {
  content: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  children: ReactNode;
  className?: string;
}

const SIDE_CLASSES: Record<string, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

const SIDE_INITIAL: Record<string, { opacity: number; y?: number; x?: number }> = {
  top: { opacity: 0, y: 4 },
  bottom: { opacity: 0, y: -4 },
  left: { opacity: 0, x: 4 },
  right: { opacity: 0, x: -4 },
};

export function AuraTooltip({
  content,
  side = "top",
  children,
  className,
}: AuraTooltipProps) {
  const [visible, setVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  return (
    <span
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      <AnimatePresence>
        {visible && (
          <motion.span
            initial={prefersReducedMotion ? { opacity: 0 } : SIDE_INITIAL[side]}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute z-tooltip pointer-events-none",
              "bg-ink c-paper t-caption px-2.5 py-1.5 rounded-sm shadow-elevated whitespace-nowrap",
              SIDE_CLASSES[side]
            )}
            role="tooltip"
          >
            {content}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

export default AuraTooltip;

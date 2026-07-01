"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * LoadingSpinner — branded spinner using Aura gold accent.
 *
 * A rotating ring with a gold dot, using CSS animations (not framer-motion
 * loop) for 60fps performance. Honors prefers-reduced-motion (static state).
 *
 * Sizes: "sm" (16px), "md" (24px), "lg" (40px)
 */

export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

const SIZES: Record<string, { ring: string; dot: string }> = {
  sm: { ring: "w-4 h-4", dot: "w-1 h-1" },
  md: { ring: "w-6 h-6", dot: "w-1.5 h-1.5" },
  lg: { ring: "w-10 h-10", dot: "w-2 h-2" },
};

export function LoadingSpinner({
  size = "md",
  className,
  label = "Loading",
}: LoadingSpinnerProps) {
  const prefersReducedMotion = useReducedMotion();
  const dims = SIZES[size];

  return (
    <div
      className={cn("flex items-center gap-2", className)}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div
        className={cn(
          "rounded-full border border-hairline-gold flex items-center justify-center",
          dims.ring,
          !prefersReducedMotion && "aura-spinner-rotate"
        )}
      >
        <span className={cn("rounded-full bg-gold", dims.dot)} />
      </div>
      {size !== "sm" && (
        <span className="t-label-caps c-ink-faint">{label}</span>
      )}
    </div>
  );
}

export default LoadingSpinner;

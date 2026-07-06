"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * PullToRefreshIndicator — fixed-position spinner shown when the user
 * pulls down at the top of the page on a touch device.
 *
 * Place it once near the top of the page (e.g. above the product grid).
 * It is positioned `fixed` so it doesn't shift layout.
 *
 * Dynamic dimensions are set via CSS custom properties on the container
 * element (via ref + useEffect), consumed by utility classes. ZERO inline styles.
 */
interface PullToRefreshIndicatorProps {
  pullDistance: number;
  isRefreshing: boolean;
  threshold?: number;
}

export function PullToRefreshIndicator({
  pullDistance,
  isRefreshing,
  threshold = 70,
}: PullToRefreshIndicatorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<SVGSVGElement>(null);

  const progress = Math.min(pullDistance / threshold, 1);
  const showSpinner = isRefreshing || pullDistance >= threshold;
  const height = isRefreshing ? threshold : pullDistance;
  const isVisible = pullDistance !== 0 || isRefreshing;

  // Set CSS custom properties via ref — no inline styles.
  useEffect(() => {
    if (!isVisible) return;
    if (containerRef.current) {
      containerRef.current.style.setProperty("--pull-height", `${height}px`);
    }
    if (arrowRef.current) {
      arrowRef.current.style.setProperty("--arrow-rotation", `${progress * 180}deg`);
    }
  }, [height, progress, isVisible]);

  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      className="fixed top-16 left-0 right-0 z-sticky flex items-center justify-center pointer-events-none h-[var(--pull-height)]"
      aria-hidden="true"
    >
      <motion.div
        initial={false}
        animate={{ scale: showSpinner ? 1 : 0.6 + progress * 0.4, opacity: 1 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "w-8 h-8 rounded-full bg-paper border border-hairline shadow-sm flex items-center justify-center",
          showSpinner ? "c-gold-deep" : "c-ink-faint"
        )}
      >
        {showSpinner ? (
          <Loader2 size={16} strokeWidth={2} className="animate-spin" />
        ) : (
          <ArrowDown
            ref={arrowRef}
            size={16}
            strokeWidth={2}
            className="rotate-[var(--arrow-rotation)]"
          />
        )}
      </motion.div>
    </div>
  );
}

export default PullToRefreshIndicator;

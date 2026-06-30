"use client";

import { motion } from "framer-motion";
import { Loader2, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * PullToRefreshIndicator — fixed-position spinner shown when the user
 * pulls down at the top of the page on a touch device.
 *
 * Place it once near the top of the page (e.g. above the product grid).
 * It is positioned `fixed` so it doesn't shift layout.
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
  if (pullDistance === 0 && !isRefreshing) return null;

  const progress = Math.min(pullDistance / threshold, 1);
  const showSpinner = isRefreshing || pullDistance >= threshold;

  return (
    <div
      className="fixed top-16 left-0 right-0 z-sticky flex items-center justify-center pointer-events-none"
      style={{ height: isRefreshing ? threshold : pullDistance }}
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
            size={16}
            strokeWidth={2}
            style={{ transform: `rotate(${progress * 180}deg)` }}
          />
        )}
      </motion.div>
    </div>
  );
}

export default PullToRefreshIndicator;

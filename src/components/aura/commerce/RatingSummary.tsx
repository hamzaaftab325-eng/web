"use client";

import { useSyncExternalStore } from "react";

import { motion, useReducedMotion } from "framer-motion";
import { PenLine, Star } from "lucide-react";

import { cn } from "@/lib/utils";

import { StarRating } from "./StarRating";

/**
 * Hydration-safe "is client" flag. Returns false during SSR and the first
 * hydration render, then true after hydration. Avoids the lint-flagged
 * `useEffect(() => setMounted(true))` pattern.
 */
function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

interface RatingSummaryProps {
  averageRating: number;
  total: number;
  distribution: { stars: number; count: number }[];
  onWriteReview?: () => void;
  activeFilter?: number | null;
  onFilter?: (stars: number | null) => void;
}

/**
 * RatingSummary — overview of a product's review distribution.
 *
 * Left column: a large display-grade average with stars and a
 * "Write a Review" action. Right column: an animated 5→1 star
 * distribution where each bar is clickable to filter reviews.
 *
 * When there are zero reviews, an empty state with a gold-pale
 * icon circle is shown.
 */
export function RatingSummary({
  averageRating,
  total,
  distribution,
  onWriteReview,
  activeFilter = null,
  onFilter,
}: RatingSummaryProps) {
  const prefersReducedMotion = useReducedMotion();
  const mounted = useIsClient();

  if (total === 0) {
    return (
      <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm card-modern p-6 md:p-10">
        <div className="flex flex-col items-center text-center">
          <span className="w-14 h-14 rounded-full bg-gold-pale flex items-center justify-center mb-4">
            <Star size={22} strokeWidth={1.25} className="c-gold-deep" />
          </span>
          <p className="t-headline-sm c-ink mb-2">No reviews yet</p>
          <p className="t-body-sm c-ink-muted max-w-xs">
            Be the first to share your experience with this piece.
          </p>
          {onWriteReview && (
            <button
              onClick={onWriteReview}
              className="mt-5 inline-flex items-center gap-2 t-label-caps c-ink hover:c-gold-deep transition-colors link-underline"
            >
              <PenLine size={14} strokeWidth={1.5} />
              Write a Review
            </button>
          )}
        </div>
      </div>
    );
  }

  const maxCount = Math.max(1, ...distribution.map((d) => d.count));
  const sortedDist = [...distribution].sort((a, b) => b.stars - a.stars);

  return (
    <div className="bg-gradient-card-warm border border-hairline-cream rounded-sm card-modern p-6 md:p-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
        {/* Average */}
        <div className="flex flex-col items-center md:items-start justify-center text-center md:text-left">
          <p className="t-display-md c-ink t-num leading-none">
            {averageRating.toFixed(1)}
          </p>
          <div className="mt-3">
            <StarRating rating={averageRating} size="md" />
          </div>
          <p className="t-caption c-ink-faint mt-3 t-label-caps">
            Based on {total} review{total === 1 ? "" : "s"}
          </p>
          {onWriteReview && (
            <button
              onClick={onWriteReview}
              className="mt-6 inline-flex items-center gap-2 t-label-caps c-ink hover:c-gold-deep transition-colors link-underline"
            >
              <PenLine size={14} strokeWidth={1.5} />
              Write a Review
            </button>
          )}
        </div>

        {/* Distribution */}
        <div className="space-y-2">
          {sortedDist.map(({ stars, count }) => {
            const isActive = activeFilter === stars;
            const pct = (count / maxCount) * 100;
            return (
              <button
                key={stars}
                type="button"
                onClick={() => onFilter?.(isActive ? null : stars)}
                className={cn(
                  "w-full flex items-center gap-3 p-1.5 -m-1.5 transition-colors rounded-sm",
                  isActive ? "bg-gold-pale" : "hover:bg-cream"
                )}
                aria-pressed={isActive}
                aria-label={`Filter by ${stars} star${stars > 1 ? "s" : ""}`}
              >
                <span className="t-body-sm c-ink-muted w-10 flex items-center gap-1">
                  {stars}
                  <Star size={12} className="fill-gold c-gold" />
                </span>
                <div className="flex-1 h-2 bg-cream-deep rounded-full overflow-hidden">
                  <motion.div
                    initial={mounted ? { width: 0 } : false}
                    animate={{ width: `${pct}%` }}
                    transition={{
                      duration: prefersReducedMotion ? 0 : 0.8,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className={cn(
                      "h-full rounded-full",
                      isActive ? "bg-gold-deep" : "bg-gold"
                    )}
                  />
                </div>
                <span className="t-body-sm c-ink-faint t-num w-8 text-right">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default RatingSummary;

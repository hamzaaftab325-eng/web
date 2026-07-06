"use client";

import { useState } from "react";
import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
  ariaLabel?: string;
}

const sizeMap = {
  sm: 14,
  md: 16,
  lg: 22,
};

/**
 * StarRating — star display/picker for product reviews.
 *
 * Display mode renders filled / half / empty stars based on the numeric
 * rating. Interactive mode renders clickable stars with a hover preview,
 * scaling each star slightly on hover (`hover:scale-110`).
 *
 * Active (filled) stars use `fill-gold c-gold`. Inactive stars use
 * `c-ink-faint` at reduced opacity. All hover states resolve to
 * `c-gold-deep`.
 */
export function StarRating({
  rating,
  size = "md",
  interactive = false,
  onChange,
  className,
  ariaLabel,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const px = sizeMap[size];

  if (interactive) {
    const preview = hoverRating || rating;
    return (
      <div
        className={cn("inline-flex items-center gap-1", className)}
        role="radiogroup"
        aria-label={ariaLabel || "Star rating"}
      >
        {[1, 2, 3, 4, 5].map((i) => {
          const isActive = preview >= i;
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={rating === i}
              aria-label={`${i} star${i > 1 ? "s" : ""}`}
              onMouseEnter={() => setHoverRating(i)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => onChange?.(i)}
              className="p-0.5 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            >
              <Star
                size={px}
                strokeWidth={1.5}
                className={cn(
                  "transition-colors",
                  isActive
                    ? "fill-gold c-gold"
                    : "c-ink-faint opacity-30 hover:c-gold-deep hover:opacity-100"
                )}
              />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={cn("inline-flex items-center gap-1", className)}
      role="img"
      aria-label={ariaLabel || `Rated ${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((i) => {
        if (rating >= i) {
          return (
            <Star
              key={i}
              size={px}
              strokeWidth={1.5}
              className="fill-gold c-gold"
            />
          );
        }
        if (rating >= i - 0.5) {
          return (
            <StarHalf
              key={i}
              size={px}
              strokeWidth={1.5}
              className="fill-gold c-gold"
            />
          );
        }
        return (
          <Star
            key={i}
            size={px}
            strokeWidth={1.5}
            className="c-ink-faint opacity-30"
          />
        );
      })}
    </div>
  );
}

export default StarRating;

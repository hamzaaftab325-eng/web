"use client";

import { useEffect, useState } from "react";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Users, Eye } from "lucide-react";

import { cn } from "@/lib/utils";

interface SocialProofProps {
  productName: string;
  className?: string;
}

/**
 * Deterministic per-hour social proof numbers.
 *
 * We hash the product name together with the current hour bucket so the
 * counts are stable within an hour window (no flicker on re-render) but
 * vary across products and over time. The result is mapped to a small
 * believable range. If the "in cart" count falls below 3 the entire
 * component renders nothing.
 */
function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function computeCounts(productName: string, hourBucket: number) {
  const seed = hashString(`${productName}::${hourBucket}`);
  // 3–14 in cart, 12–49 viewed in 24h.
  const inCart = 3 + (seed % 12);
  const viewed = 12 + ((seed >> 8) % 38);
  return { inCart, viewed };
}

export function SocialProof({ productName, className }: SocialProofProps) {
  const prefersReducedMotion = useReducedMotion();
  const [counts, setCounts] = useState<{ inCart: number; viewed: number } | null>(null);

  useEffect(() => {
    const compute = () => {
      const hourBucket = Math.floor(Date.now() / 3_600_000);
      setCounts(computeCounts(productName, hourBucket));
    };
    compute();
    // Re-resolve at the top of each hour.
    const interval = setInterval(compute, 60_000);
    return () => clearInterval(interval);
  }, [productName]);

  if (!counts) return null;
  // Hidden if count < 3 (per spec).
  if (counts.inCart < 3) return null;

  const dot = (
    <motion.span
      aria-hidden="true"
      className="block w-1.5 h-1.5 rounded-full bg-gold"
      animate={
        prefersReducedMotion
          ? undefined
          : { scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }
      }
      transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
    />
  );

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-5 gap-y-1.5 t-caption c-ink-muted",
        className
      )}
      role="status"
      aria-live="polite"
    >
      <AnimatePresence>
        <motion.span
          key={`cart-${counts.inCart}`}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2"
        >
          {dot}
          <Users size={13} strokeWidth={1.5} className="c-gold-deep" />
          <span>
            <span className="c-ink font-medium t-num">{counts.inCart}</span> people have this
            in their cart
          </span>
        </motion.span>
        <motion.span
          key={`view-${counts.viewed}`}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="inline-flex items-center gap-2"
        >
          <Eye size={13} strokeWidth={1.5} className="c-gold-deep" />
          <span>
            <span className="c-ink font-medium t-num">{counts.viewed}</span> viewed in the last
            24 hours
          </span>
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

export default SocialProof;

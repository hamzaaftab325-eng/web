"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/**
 * EmptyState — reusable empty-state component.
 *
 * Props:
 * - icon: Lucide icon component (e.g., ShoppingBag, Heart, Search)
 * - title: short headline (e.g., "No saved pieces yet")
 * - description: longer description (1-2 sentences)
 * - action: optional CTA button/element
 *
 * Animated entrance with prefers-reduced-motion honored.
 */

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-col items-center justify-center text-center py-16 md:py-24 px-6 ${className ?? ""}`}
    >
      <div className="w-14 h-14 rounded-full bg-gold-pale flex items-center justify-center mb-6">
        <Icon size={24} strokeWidth={1.25} className="c-gold-deep" />
      </div>
      <h3 className="t-headline-md c-ink leading-tight mb-3">{title}</h3>
      {description && (
        <p className="t-body c-ink-muted max-w-md leading-relaxed mb-6">
          {description}
        </p>
      )}
      {action}
    </motion.div>
  );
}

export default EmptyState;

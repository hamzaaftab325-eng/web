"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { BadgeKind } from "@/types";

/**
 * Badge — small status indicator for product cards and lists.
 *
 * cva-driven with five variants. The `kind` prop maps a `BadgeKind` value to
 * the correct variant, while the `variant` prop is also exposed for direct use.
 */
export const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1 t-label-caps px-2.5 py-1.5 leading-none whitespace-nowrap rounded-sm",
  {
    variants: {
      variant: {
        new: "bg-paper c-ink border border-hairline",
        bestseller: "bg-paper c-ink border border-hairline",
        sale: "bg-gold c-paper",
        "sold-out": "bg-ink c-paper",
        neutral: "bg-cream c-ink-muted border border-hairline",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
);

const KIND_TO_VARIANT: Record<BadgeKind, VariantProps<typeof badgeVariants>["variant"]> = {
  New: "new",
  Bestseller: "bestseller",
  Sale: "sale",
  "Sold Out": "sold-out",
};

const VARIANT_LABEL: Record<NonNullable<VariantProps<typeof badgeVariants>["variant"]>, string> = {
  new: "New",
  bestseller: "Bestseller",
  sale: "Sale",
  "sold-out": "Sold Out",
  neutral: "",
};

export interface BadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children">,
    VariantProps<typeof badgeVariants> {
  kind?: BadgeKind;
  label?: string;
}

export function Badge({ kind, variant, label, className, ...props }: BadgeProps) {
  const resolvedVariant = kind ? KIND_TO_VARIANT[kind] : variant;
  const text = label ?? (resolvedVariant ? VARIANT_LABEL[resolvedVariant] : "") ?? (kind ?? "");

  return (
    <span
      className={cn(badgeVariants({ variant: resolvedVariant }), className)}
      data-slot="aura-badge"
      {...props}
    >
      {text}
    </span>
  );
}

export default Badge;

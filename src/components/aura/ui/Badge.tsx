"use client";

import * as React from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Badge — premium product status indicator.
 *
 * Used on ProductCard, ProductDetailPage, and admin product forms.
 * 8 badge types, each with a distinct visual style.
 * Database-driven via Product.badge (string) — the kind prop maps to a variant.
 */

export type BadgeKind =
  | "New"
  | "Bestseller"
  | "Sale"
  | "Sold Out"
  | "Limited"
  | "Back in Stock"
  | "Featured"
  | "Exclusive";

export const BADGE_OPTIONS: BadgeKind[] = [
  "New",
  "Bestseller",
  "Sale",
  "Sold Out",
  "Limited",
  "Back in Stock",
  "Featured",
  "Exclusive",
];

export const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1 t-label-caps px-2.5 py-1.5 leading-none whitespace-nowrap rounded-sm transition-colors",
  {
    variants: {
      variant: {
        new: "bg-paper c-ink border border-ink/20",
        bestseller: "bg-ink c-paper",
        sale: "bg-gold c-paper",
        "sold-out": "bg-ink/80 c-paper/60 line-through",
        limited: "bg-error c-paper",
        "back-in-stock": "bg-success c-paper",
        featured: "bg-gradient-to-r from-gold to-gold-deep c-paper",
        exclusive: "bg-ink c-gold border border-gold/40",
      },
    },
    defaultVariants: {
      variant: "new",
    },
  }
);

const KIND_TO_VARIANT: Record<BadgeKind, VariantProps<typeof badgeVariants>["variant"]> = {
  New: "new",
  Bestseller: "bestseller",
  Sale: "sale",
  "Sold Out": "sold-out",
  Limited: "limited",
  "Back in Stock": "back-in-stock",
  Featured: "featured",
  Exclusive: "exclusive",
};

export interface BadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children">,
    VariantProps<typeof badgeVariants> {
  kind?: BadgeKind | string | null;
  label?: string;
}

export function Badge({ kind, variant, label, className, ...props }: BadgeProps) {
  // Resolve the variant from kind (case-insensitive match)
  let resolvedVariant = variant;
  if (kind && !variant) {
    const normalized = String(kind).trim();
    const match = (Object.keys(KIND_TO_VARIANT) as BadgeKind[]).find(
      (k) => k.toLowerCase() === normalized.toLowerCase()
    );
    resolvedVariant = match ? KIND_TO_VARIANT[match] : "new";
  }

  const text = label ?? (kind ? String(kind) : "");

  if (!text) return null;

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

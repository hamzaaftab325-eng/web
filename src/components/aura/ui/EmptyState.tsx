import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Shared empty-state component.
 *
 * Phase 5E: Replaces 5 hand-rolled empty states in:
 *   - src/components/aura/commerce/ProductGrid.tsx
 *   - src/components/aura/commerce/CartView.tsx
 *   - src/components/aura/commerce/CartDrawer.tsx
 *   - src/components/aura/commerce/WishlistDrawer.tsx
 *   - src/app/sale/page.tsx
 *
 * Provides a consistent visual pattern: icon + headline + body + optional CTA.
 * All props are optional except `title` — use the minimum needed.
 */

export interface EmptyStateProps {
  /** Lucide icon component (e.g. ShoppingBag, Heart, Search). Optional. */
  icon?: React.ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }>;
  /** Icon size in pixels. Default 40. */
  iconSize?: number;
  /** Main headline (e.g. "Your cart is empty"). */
  title: string;
  /** Supporting body text. Optional. */
  body?: string;
  /** Call-to-action button/link. Pass a <Link> or <button>. Optional. */
  cta?: ReactNode;
  /** Additional className for the container. */
  className?: string;
}

export function EmptyState({
  icon: Icon,
  iconSize = 40,
  title,
  body,
  cta,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("py-16 text-center", className)}>
      {Icon && (
        <Icon
          size={iconSize}
          className="c-ink-faint mx-auto mb-4"
          aria-hidden
        />
      )}
      <p className="t-headline-md c-ink-muted mb-2">{title}</p>
      {body && <p className="t-body c-ink-faint">{body}</p>}
      {cta && <div className="mt-6">{cta}</div>}
    </div>
  );
}

export default EmptyState;

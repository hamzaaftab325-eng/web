"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * usePageViewTracking — fires a page view tracking event on every route change.
 *
 * Sends POST /api/track/page-view with the current pathname and referrer.
 * Fire-and-forget — errors are silently ignored.
 */
export function usePageViewTracking() {
  const pathname = usePathname();

  useEffect(() => {
    // Skip tracking for API routes and admin pages
    if (pathname.startsWith("/api/") || pathname.startsWith("/admin/")) return;

    const referrer = document.referrer || undefined;

    fetch("/api/track/page-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, referrer }),
    }).catch(() => {});
  }, [pathname]);
}

/**
 * Track a product view — call from product detail pages.
 */
export function trackProductView(productSlug: string, productId?: string) {
  fetch("/api/track/product-view", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productSlug, productId }),
  }).catch(() => {});
}

/**
 * Track a cart event.
 */
export function trackCartEvent(
  eventType: "add_to_cart" | "remove_from_cart" | "begin_checkout" | "purchase",
  productSlug?: string,
  productId?: string,
  quantity?: number,
) {
  fetch("/api/track/cart-event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventType, productSlug, productId, quantity }),
  }).catch(() => {});
}

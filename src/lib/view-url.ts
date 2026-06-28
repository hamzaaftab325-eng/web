import type { ViewKey } from "@/types";

/**
 * View ↔ URL mapping for shareable page links.
 *
 * Each top-level view maps to a URL path. Views without a URL
 * (product-detail, account-order-detail) are client-state-only
 * and don't have shareable links — they're navigated to via
 * clicks within the app.
 */

const VIEW_TO_URL: Partial<Record<ViewKey, string>> = {
  home: "/",
  shop: "/shop",
  about: "/about",
  journal: "/journal",
  collections: "/collections",
  artisans: "/artisans",
  sustainability: "/sustainability",
  care: "/care",
  login: "/login",
  signup: "/signup",
  "forgot-password": "/forgot-password",
  "reset-password": "/reset-password",
  account: "/account",
  "account-orders": "/account/orders",
  "account-addresses": "/account/addresses",
  "account-wishlist": "/account/wishlist",
  "account-preferences": "/account/preferences",
};

const URL_TO_VIEW: Record<string, ViewKey> = {};
for (const [view, url] of Object.entries(VIEW_TO_URL)) {
  if (url) URL_TO_VIEW[url] = view as ViewKey;
}

/**
 * Convert a ViewKey to its URL path.
 * Returns undefined for views without a shareable URL.
 */
export function viewToUrl(view: ViewKey): string | undefined {
  return VIEW_TO_URL[view];
}

/**
 * Convert a URL pathname to a ViewKey.
 * Handles nested routes (e.g., /account/orders/123 → "account-order-detail").
 * Returns undefined for unknown URLs.
 */
export function urlToView(pathname: string): ViewKey | undefined {
  // Exact match first
  const exact = URL_TO_VIEW[pathname];
  if (exact) return exact;

  // Nested account routes
  if (pathname.startsWith("/account/orders/")) return "account-order-detail";

  // Product detail (not URL-routed yet, but handle gracefully)
  if (pathname.startsWith("/product/")) return "product-detail";

  return undefined;
}

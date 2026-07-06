/**
 * GA4 (Google Analytics 4) event tracker.
 *
 * Loads the gtag.js script and sends events. Measurement ID is read
 * from NEXT_PUBLIC_GA4_ID env var — if not set, all calls are no-ops.
 *
 * Safe to import on SSR (all window access is guarded).
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export const GA4_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_ID ?? "";

let initialized = false;

/** Standard GA4 event names as constants. */
export const GA4_EVENTS = {
  VIEW_ITEM_LIST: "view_item_list",
  VIEW_ITEM: "view_item",
  SELECT_ITEM: "select_item",
  ADD_TO_CART: "add_to_cart",
  REMOVE_FROM_CART: "remove_from_cart",
  VIEW_CART: "view_cart",
  BEGIN_CHECKOUT: "begin_checkout",
  ADD_SHIPPING_INFO: "add_shipping_info",
  ADD_PAYMENT_INFO: "add_payment_info",
  PURCHASE: "purchase",
  SEARCH: "search",
  SIGN_UP: "sign_up",
  LOGIN: "login",
} as const;

/** Load the gtag.js script and configure GA4. */
export function initGA4(measurementId: string): void {
  if (typeof window === "undefined" || !measurementId || initialized) return;

  // Load gtag script
  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", measurementId, { send_page_view: false });

  initialized = true;
}

/** Send an event to GA4. No-op if gtag not loaded. */
export function trackGA4(eventName: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", eventName, params ?? {});
}

const ga4Default = { initGA4, trackGA4, GA4_EVENTS };
export default ga4Default;

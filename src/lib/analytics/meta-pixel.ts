/**
 * Meta Pixel (Facebook Pixel) event tracker.
 *
 * Loads the fbq script and sends events. Pixel ID is read from
 * NEXT_PUBLIC_META_PIXEL_ID env var — if not set, all calls are no-ops.
 *
 * Safe to import on SSR (all window access is guarded).
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";

let initialized = false;

/**
 * Map GA4 event names to Meta Pixel standard event names.
 * Events not in this map are sent as custom events.
 */
const GA4_TO_META: Record<string, string> = {
  add_to_cart: "AddToCart",
  begin_checkout: "InitiateCheckout",
  purchase: "Purchase",
  search: "Search",
  sign_up: "CompleteRegistration",
  login: "Login",
  view_item: "ViewContent",
};

/** Load the Meta Pixel script. */
export function initMetaPixel(pixelId: string): void {
  if (typeof window === "undefined" || !pixelId || initialized) return;

  /* eslint-disable @typescript-eslint/no-explicit-any -- Meta Pixel SDK requires loose typing */
  (function (f: any, b: Document, e: string, v: string) {
    if (f.fbq) return;
    const n: any = (f.fbq = function (...args: unknown[]) {
      // Meta Pixel SDK official snippet uses .apply(); we use .call() with
      // spread to satisfy prefer-spread (functionally equivalent).
      if (n.callMethod) {
        n.callMethod.call(n, ...args);
      } else {
        n.queue.push(args);
      }
    });
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    const t = b.createElement(e) as HTMLScriptElement;
    t.async = true;
    t.src = v;
    const s = b.getElementsByTagName(e)[0];
    s.parentNode?.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  /* eslint-enable @typescript-eslint/no-explicit-any */

  window.fbq?.("init", pixelId);
  window.fbq?.("track", "PageView");

  initialized = true;
}

/** Send an event to Meta Pixel. Maps GA4 names to Meta standard events. */
export function trackMetaPixel(eventName: string, params?: Record<string, unknown>): void {
  if (typeof window === "undefined" || !window.fbq) return;
  const metaEventName = GA4_TO_META[eventName] ?? eventName;
  window.fbq("track", metaEventName, params ?? {});
}

const metaPixelDefault = { initMetaPixel, trackMetaPixel };
export default metaPixelDefault;

/**
 * Central analytics tracking function.
 *
 * ALL events flow through this single function. It routes to GA4 and/or
 * Meta Pixel based on what's initialized. Checks for consent before firing.
 *
 * Swap destinations later by editing this one file.
 */

declare global {
  interface Window {
    __analyticsConsent?: boolean;
  }
}

import { trackGA4 } from "./ga4";
import { trackMetaPixel } from "./meta-pixel";

/**
 * Track an analytics event.
 *
 * @param eventName - Standard event name (use GA4_EVENTS constants)
 * @param params - Event parameters (typed by caller)
 *
 * No-ops if:
 * - Running on SSR (no window)
 * - Consent not given (window.__analyticsConsent !== true)
 * - Neither GA4 nor Meta Pixel is loaded
 */
export function track(eventName: string, params?: object): void {
  if (typeof window === "undefined") return;
  if (window.__analyticsConsent !== true) return;

  trackGA4(eventName, params as Record<string, unknown>);
  trackMetaPixel(eventName, params as Record<string, unknown>);
}

export default track;

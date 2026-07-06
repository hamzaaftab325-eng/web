/**
 * Ambient global type augmentations for the analytics layer.
 *
 * These properties are only ever set on `window` at runtime after explicit
 * user consent + script injection (see `ga4.ts`, `meta-pixel.ts`, and the
 * `AnalyticsProvider` component). They are all optional so that consuming
 * code can safely guard with `typeof window.gtag === "function"`.
 */

/**
 * Shape of the Meta Pixel `fbq` function once the fbevents.js bootstrap has
 * attached its internal `queue` / `callMethod` / `loaded` / `version` /
 * `push` fields. Before the script loads we set these ourselves so the
 * stub queues calls and replays them when the real implementation arrives.
 */
export interface FbqFn {
  (...args: unknown[]): void;
  queue: unknown[];
  callMethod?: (...args: unknown[]) => void;
  loaded?: boolean;
  version?: string;
  push?: (...args: unknown[]) => void;
}

declare global {
  interface Window {
    /** Set by AnalyticsProvider / CookieConsent after a user choice. */
    __analyticsConsent?: boolean;
    /** gtag.js entry point (GA4). */
    gtag?: (...args: unknown[]) => void;
    /** GA4 dataLayer buffer. */
    dataLayer?: unknown[];
    /** Meta Pixel entry point. */
    fbq?: FbqFn;
    /** Meta Pixel internal sentinel used to detect double-init. */
    _fbq?: FbqFn;
  }
}

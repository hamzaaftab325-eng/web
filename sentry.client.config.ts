/**
 * Sentry client-side configuration.
 *
 * Phase 14: Captures browser-side errors and unhandled promise rejections.
 * Set SENTRY_DSN in your Vercel environment variables to activate.
 * If SENTRY_DSN is not set, Sentry is a no-op (no errors thrown).
 */

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 0.1, // 10% of transactions traced
    replaysSessionSampleRate: 0.05, // 5% of sessions recorded
    replaysOnErrorSampleRate: 1.0, // 100% of error sessions recorded
    environment: process.env.NODE_ENV,
    release: process.env.VERCEL_GIT_COMMIT_SHA,
    ignoreErrors: [
      // Ignore common browser extension errors
      "ResizeObserver loop limit exceeded",
      "Non-Error promise rejection captured",
    ],
  });
}

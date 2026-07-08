/**
 * Sentry server-side configuration.
 *
 * Phase 14: Captures server-side errors in API routes and Server Components.
 * Set SENTRY_DSN in your Vercel environment variables to activate.
 */

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    tracesSampleRate: 0.1,
    environment: process.env.NODE_ENV,
    release: process.env.VERCEL_GIT_COMMIT_SHA,
  });
}

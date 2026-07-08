/**
 * Site URL helper — fail-fast in production if NEXT_PUBLIC_SITE_URL is missing.
 *
 * Previously the codebase had hardcoded fallbacks to "https://aura-living-1.vercel.app"
 * in 4 routes (forgot-password, low-stock-alerts, daily-order-digest, newsletter).
 * If the env var was unset in production, password-reset emails and cron alerts
 * would link to the wrong domain — a security and UX risk.
 *
 * Now: production throws (crashes the route loudly), development falls back
 * to localhost so the app still works for local dev.
 */

/**
 * Site URL helper — fail-fast in production runtime if NEXT_PUBLIC_SITE_URL is missing.
 *
 * Phase 10A: Replaced hardcoded fallbacks with this helper.
 * Phase 12 fix: Don't throw during `next build` — the env var may not be
 * available at build time in local/CI environments. Only throw at runtime
 * in production (when a user actually hits the route).
 *
 * Detection: Next.js sets NEXT_PHASE=phase-production-build during build.
 * If that's set, we use a placeholder URL instead of throwing.
 */
export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const isProduction = process.env.NODE_ENV === "production";
  const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

  if (envUrl) {
    return envUrl.replace(/\/$/, ""); // strip trailing slash
  }

  // During `next build` in production mode — don't throw, use placeholder.
  // The real URL will be available at runtime via env var.
  if (isProduction && isBuildPhase) {
    return "https://aura-living-1.vercel.app";
  }

  // At runtime in production — throw if env var is missing.
  if (isProduction) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL environment variable is required in production. " +
      "Set it to your canonical deployment URL (e.g. https://aura-living.vercel.app).",
    );
  }

  // Development — fall back to localhost.
  return "http://localhost:3000";
}

/**
 * Build an absolute URL for a path on this site.
 *
 * Convenience wrapper around `getSiteUrl()` for the common pattern of
 * `getSiteUrl() + path`.
 */
export function buildUrl(path: string): string {
  const base = getSiteUrl();
  const separator = path.startsWith("/") ? "" : "/";
  return `${base}${separator}${path}`;
}

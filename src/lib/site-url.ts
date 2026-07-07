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
 * Get the canonical site URL.
 *
 * - In production: returns `process.env.NEXT_PUBLIC_SITE_URL` (throws if missing).
 * - In development: returns `process.env.NEXT_PUBLIC_SITE_URL` if set, else
 *   `http://localhost:3000`.
 *
 * The returned URL never has a trailing slash — callers can safely append paths.
 */
export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const isProduction = process.env.NODE_ENV === "production";

  if (envUrl) {
    return envUrl.replace(/\/$/, ""); // strip trailing slash
  }

  if (isProduction) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL environment variable is required in production. " +
      "Set it to your canonical deployment URL (e.g. https://aura-living.vercel.app).",
    );
  }

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

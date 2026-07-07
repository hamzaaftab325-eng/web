import { NextResponse } from "next/server";

const ACCESS_COOKIE = "aura_access";
const REFRESH_COOKIE = "aura_refresh";
const isProduction = process.env.NODE_ENV === "production";

/**
 * Phase 7 fix: Changed sameSite from "strict" to "lax".
 *
 * sameSite: "strict" was causing a redirect loop:
 *   1. User goes to /admin → middleware redirects to /login?redirect=/admin
 *   2. User logs in → window.location.href = "/admin" (top-level navigation)
 *   3. Browser sends request to /admin — but with sameSite: "strict", the auth
 *      cookies are NOT sent on the first navigation after coming from /login
 *   4. Middleware sees no cookies → redirects back to /login
 *   5. LOOP
 *
 * sameSite: "lax" sends cookies on top-level GET navigations (which is what
 * we want for page loads) but still blocks CSRF on cross-site POST requests.
 * This is the industry standard for auth cookies.
 *
 * Also: maxAge for access cookie now respects JWT_ACCESS_EXPIRY env var
 * instead of hardcoded 15 minutes. Same for refresh cookie.
 */
export function setAuthCookies(response: NextResponse, accessToken: string, refreshToken: string): void {
  const accessMaxAge = parseExpiryToSeconds(process.env.JWT_ACCESS_EXPIRY ?? "15m");
  const refreshMaxAge = parseExpiryToSeconds(process.env.JWT_REFRESH_EXPIRY ?? "7d");

  response.cookies.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: accessMaxAge,
  });
  response.cookies.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: refreshMaxAge,
  });
}

/**
 * Parse a duration string like "15m", "7d", "1h", "30s" into seconds.
 * Falls back to the provided default if parsing fails.
 */
function parseExpiryToSeconds(expiry: string): number {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) return 15 * 60; // default 15 minutes
  const value = parseInt(match[1], 10);
  const unit = match[2];
  switch (unit) {
    case "s": return value;
    case "m": return value * 60;
    case "h": return value * 60 * 60;
    case "d": return value * 24 * 60 * 60;
    default: return 15 * 60;
  }
}

export function clearAuthCookies(response: NextResponse): void {
  response.cookies.set(ACCESS_COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
  response.cookies.set(REFRESH_COOKIE, "", { httpOnly: true, sameSite: "lax", path: "/", maxAge: 0 });
}

export function getAccessToken(request: Request): string | undefined {
  const cookieHeader = request.headers.get("cookie") || "";
  return Object.fromEntries(cookieHeader.split("; ").map(c => { const [k, ...v] = c.split("="); return [k, v.join("=")]; }))[ACCESS_COOKIE];
}

export function getRefreshToken(request: Request): string | undefined {
  const cookieHeader = request.headers.get("cookie") || "";
  return Object.fromEntries(cookieHeader.split("; ").map(c => { const [k, ...v] = c.split("="); return [k, v.join("=")]; }))[REFRESH_COOKIE];
}

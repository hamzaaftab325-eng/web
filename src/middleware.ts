import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware — runs on Edge Runtime before every matched request.
 *
 * Features:
 * 1. Auth check (cookie existence for protected routes)
 * 2. Guest checkout allowed (POST /api/orders)
 *
 * Behavior:
 *   - /admin, /account pages → redirect to /login if no cookie
 *   - /api/user/*, /api/admin/*, /api/notifications/* → 401 if no cookie
 *   - GET /api/orders → 401 if no cookie (order history requires auth)
 *   - POST /api/orders → allowed for guests (COD checkout)
 *   - All other requests → pass through
 */
const PAGE_PREFIXES = ["/account", "/admin"];
const API_PREFIXES = ["/api/user", "/api/admin", "/api/notifications"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPage = PAGE_PREFIXES.some(p => pathname === p || pathname.startsWith(p + "/"));
  const isApi = API_PREFIXES.some(p => pathname.startsWith(p));
  const isOrdersGet = pathname.startsWith("/api/orders") && request.method === "GET";

  if (!isPage && !isApi && !isOrdersGet) return NextResponse.next();

  // Check if auth cookie exists
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = Object.fromEntries(
    cookieHeader.split("; ").map(c => {
      const [k, ...v] = c.split("=");
      return [k, v.join("=")];
    })
  );
  const hasAccessCookie = Boolean(cookies["aura_access"]);
  const hasRefreshCookie = Boolean(cookies["aura_refresh"]);

  if (!hasAccessCookie && !hasRefreshCookie) {
    if (isApi || isOrdersGet) {
      return NextResponse.json(
        { error: "Authentication required", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/account/:path*",
    "/admin/:path*",
    "/api/user/:path*",
    "/api/orders",
    "/api/orders/:path*",
    "/api/admin/:path*",
    "/api/notifications/:path*",
    // Phase 6 fix: Removed "/api/auth/:path*" from matcher.
    // Auth API routes (login, register, refresh, me, logout) should NOT go
    // through the middleware — the middleware's cookie-existence check was
    // interfering with auth flows (e.g., blocking /api/auth/refresh when
    // the access cookie was expired but refresh cookie was valid).
    "/api/reviews/:path*",
    "/api/upload/:path*",
  ],
};
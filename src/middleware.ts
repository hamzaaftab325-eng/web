import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, cleanupRateLimitStore } from "@/lib/rate-limit";

/**
 * Middleware — runs on Edge Runtime before every matched request.
 *
 * Features:
 * 1. Rate limiting (auth routes: 5/15min, reviews: 10/15min, upload: 20/5min, default: 100/min)
 * 2. Auth check (cookie existence for protected routes)
 * 3. Guest checkout allowed (POST /api/orders)
 *
 * Behavior:
 *   - Rate-limited routes → 429 JSON if exceeded
 *   - /admin, /account pages → redirect to /login if no cookie
 *   - /api/user/*, /api/admin/*, /api/notifications/* → 401 if no cookie
 *   - GET /api/orders → 401 if no cookie (order history requires auth)
 *   - POST /api/orders → allowed for guests (COD checkout)
 *   - All other requests → pass through
 */
const PAGE_PREFIXES = ["/account", "/admin"];
const API_PREFIXES = ["/api/user", "/api/admin", "/api/notifications"];

export async function middleware(request: NextRequest) {
  // Clean up rate limit store periodically
  cleanupRateLimitStore();

  // Rate limiting — applies to ALL API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const rateLimited = await checkRateLimit(request);
    if (rateLimited) return rateLimited;
  }

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
    "/api/auth/:path*",
    "/api/reviews/:path*",
    "/api/upload/:path*",
  ],
};

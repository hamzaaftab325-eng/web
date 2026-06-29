import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware — runs on Edge Runtime before every matched request.
 *
 * Does coarse auth (cookie existence) only. Fine-grained auth (JWT verify +
 * database role check) happens in API route handlers via requireAdmin().
 *
 * Behavior:
 *   - /admin, /account pages → redirect to /login?redirect=<path> if no cookie
 *   - /api/user/*, /api/admin/* → 401 JSON if no auth cookie
 *   - GET /api/orders → 401 JSON if no auth cookie (order history requires auth)
 *   - POST /api/orders → ALLOWED for guests (COD checkout doesn't require account)
 *   - All other requests → pass through
 */
const PAGE_PREFIXES = ["/account", "/admin"];
const API_PREFIXES = ["/api/user", "/api/admin", "/api/notifications"];

export function middleware(request: NextRequest) {
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
    // API routes → JSON 401
    if (isApi || isOrdersGet) {
      return NextResponse.json(
        { error: "Authentication required", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }
    // Page routes → redirect to login
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
    "/api/orders/:path*",
    "/api/admin/:path*",
    "/api/notifications/:path*",
  ],
};

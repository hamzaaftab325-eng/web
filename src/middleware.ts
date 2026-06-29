import { NextRequest, NextResponse } from "next/server";

// Temporary: minimal middleware to diagnose Vercel hang.
// Auth checks moved to API route handlers themselves.

const PROTECTED_PAGES = ["/account"];
const PROTECTED_APIS = ["/api/user", "/api/orders", "/api/admin"];
const ADMIN_ROUTES = ["/admin", "/api/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedPage = PROTECTED_PAGES.some(r => pathname.startsWith(r));
  const isProtectedApi = PROTECTED_APIS.some(r => pathname.startsWith(r));
  const isAdminRoute = ADMIN_ROUTES.some(r => pathname.startsWith(r));
  if (!isProtectedPage && !isProtectedApi && !isAdminRoute) return NextResponse.next();

  // Check if auth cookie exists (no JWT verification — that's done in API handlers)
  const cookieHeader = request.headers.get("cookie") || "";
  const cookies = Object.fromEntries(cookieHeader.split("; ").map(c => { const [k, ...v] = c.split("="); return [k, v.join("=")]; }));
  const hasAccessCookie = Boolean(cookies["aura_access"]);
  const hasRefreshCookie = Boolean(cookies["aura_refresh"]);

  if (!hasAccessCookie && !hasRefreshCookie) {
    if (isProtectedApi || isAdminRoute) {
      return NextResponse.json({ error: "Authentication required", code: "UNAUTHORIZED" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = { matcher: ["/account/:path*", "/admin/:path*", "/api/user/:path*", "/api/orders/:path*", "/api/admin/:path*"] };

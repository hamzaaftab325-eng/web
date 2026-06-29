import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getAccessToken, getRefreshToken } from "@/lib/auth-cookies";

const PROTECTED_PAGES = ["/account"];
const PROTECTED_APIS = ["/api/user", "/api/orders", "/api/admin"];
const ADMIN_ROUTES = ["/admin", "/api/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedPage = PROTECTED_PAGES.some(r => pathname.startsWith(r));
  const isProtectedApi = PROTECTED_APIS.some(r => pathname.startsWith(r));
  const isAdminRoute = ADMIN_ROUTES.some(r => pathname.startsWith(r));
  if (!isProtectedPage && !isProtectedApi && !isAdminRoute) return NextResponse.next();

  const accessToken = getAccessToken(request);
  let isAuthenticated = false;
  let userRole = "customer";

  if (accessToken) {
    try { const p = verifyToken(accessToken); isAuthenticated = true; userRole = p.role; } catch {}
  }
  if (!isAuthenticated) {
    const refreshToken = getRefreshToken(request);
    if (refreshToken) { try { const p = verifyToken(refreshToken); isAuthenticated = true; userRole = p.role; } catch {} }
  }

  if (!isAuthenticated) {
    if (isProtectedApi || isAdminRoute) return NextResponse.json({ error: "Authentication required", code: "UNAUTHORIZED" }, { status: 401 });
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && userRole !== "admin") {
    if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Admin access required", code: "FORBIDDEN" }, { status: 403 });
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = { matcher: ["/account/:path*", "/admin/:path*", "/api/user/:path*", "/api/orders/:path*", "/api/admin/:path*"] };

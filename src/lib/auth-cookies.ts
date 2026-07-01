import { NextResponse } from "next/server";

const ACCESS_COOKIE = "aura_access";
const REFRESH_COOKIE = "aura_refresh";
const isProduction = process.env.NODE_ENV === "production";

export function setAuthCookies(response: NextResponse, accessToken: string, refreshToken: string): void {
  response.cookies.set(ACCESS_COOKIE, accessToken, { httpOnly: true, secure: isProduction, sameSite: "strict", path: "/", maxAge: 15 * 60 });
  response.cookies.set(REFRESH_COOKIE, refreshToken, { httpOnly: true, secure: isProduction, sameSite: "strict", path: "/", maxAge: 7 * 24 * 60 * 60 });
}

export function clearAuthCookies(response: NextResponse): void {
  response.cookies.set(ACCESS_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  response.cookies.set(REFRESH_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export function getAccessToken(request: Request): string | undefined {
  const cookieHeader = request.headers.get("cookie") || "";
  return Object.fromEntries(cookieHeader.split("; ").map(c => { const [k, ...v] = c.split("="); return [k, v.join("=")]; }))[ACCESS_COOKIE];
}

export function getRefreshToken(request: Request): string | undefined {
  const cookieHeader = request.headers.get("cookie") || "";
  return Object.fromEntries(cookieHeader.split("; ").map(c => { const [k, ...v] = c.split("="); return [k, v.join("=")]; }))[REFRESH_COOKIE];
}

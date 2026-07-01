import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clearAuthCookies, getRefreshToken } from "@/lib/auth-cookies";

export async function POST(request: NextRequest) {
  try {
    const refreshToken = getRefreshToken(request);
    if (refreshToken) await db.userSession.deleteMany({ where: { refreshToken } });
    const response = NextResponse.json({ message: "Logged out" });
    clearAuthCookies(response);
    return response;
  } catch {
    const response = NextResponse.json({ message: "Logged out" });
    clearAuthCookies(response);
    return response;
  }
}

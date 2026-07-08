import { NextRequest, NextResponse } from "next/server";

import { clearAuthCookies, getRefreshToken } from "@/lib/auth-cookies";
import { db } from "@/lib/db";

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

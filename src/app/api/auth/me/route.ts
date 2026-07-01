import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken, sanitizeUser, signAccessToken } from "@/lib/auth";
import { getAccessToken, getRefreshToken, setAuthCookies } from "@/lib/auth-cookies";

async function getUser(request: NextRequest) {
  const accessToken = getAccessToken(request);
  if (accessToken) {
    try {
      const payload = verifyToken(accessToken);
      const user = await db.user.findUnique({ where: { id: payload.userId } });
      if (user && user.isActive) return user;
    } catch {}
  }
  const refreshToken = getRefreshToken(request);
  if (refreshToken) {
    try {
      const payload = verifyToken(refreshToken);
      const session = await db.userSession.findUnique({ where: { refreshToken }, include: { user: true } });
      if (session && session.user?.isActive && session.expiresAt > new Date()) {
        const newAccessToken = signAccessToken({ userId: session.user.id, email: session.user.email, role: session.user.role });
        return { user: session.user, newAccessToken, refreshToken };
      }
    } catch {}
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const result = await getUser(request);
    if (!result) return NextResponse.json({ error: "Not authenticated", code: "UNAUTHORIZED" }, { status: 401 });
    const user = "user" in result ? result.user : result;
    const response = NextResponse.json({ user: sanitizeUser(user) });
    if ("newAccessToken" in result && result.newAccessToken) setAuthCookies(response, result.newAccessToken, result.refreshToken!);
    return response;
  } catch {
    return NextResponse.json({ error: "Failed", code: "AUTH_ERROR" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const result = await getUser(request);
    if (!result) return NextResponse.json({ error: "Not authenticated", code: "UNAUTHORIZED" }, { status: 401 });
    const user = "user" in result ? result.user : result;
    const body = await request.json();
    const updated = await db.user.update({ where: { id: user.id }, data: { ...(body.firstName !== undefined && { firstName: body.firstName }), ...(body.lastName !== undefined && { lastName: body.lastName }), ...(body.phone !== undefined && { phone: body.phone }) } });
    return NextResponse.json({ user: sanitizeUser(updated), message: "Profile updated" });
  } catch {
    return NextResponse.json({ error: "Update failed", code: "UPDATE_ERROR" }, { status: 500 });
  }
}

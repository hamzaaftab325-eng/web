import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { getAccessToken, getRefreshToken } from "@/lib/auth-cookies";

/**
 * PUT /api/notifications/read-all — mark all notifications as read.
 */
export async function PUT(request: NextRequest) {
  try {
    const accessToken = getAccessToken(request);
    let payload: { userId: string } | null = null;
    if (accessToken) {
      try { payload = verifyToken(accessToken); } catch { /* expired */ }
    }
    if (!payload) {
      const refreshToken = getRefreshToken(request);
      if (refreshToken) {
        try { payload = verifyToken(refreshToken); } catch { /* invalid */ }
      }
    }
    if (!payload) {
      return NextResponse.json({ error: "Authentication required", code: "UNAUTHORIZED" }, { status: 401 });
    }

    await db.notification.updateMany({
      where: { userId: payload.userId, read: false },
      data: { read: true },
    });

    return NextResponse.json({ message: "All notifications marked as read" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "UPDATE_ERROR" }, { status: 500 });
  }
}

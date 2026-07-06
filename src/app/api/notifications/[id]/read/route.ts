import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { getAccessToken, getRefreshToken } from "@/lib/auth-cookies";

/**
 * PUT /api/notifications/[id]/read — mark a single notification as read.
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;
    await db.notification.updateMany({
      where: { id, userId: payload.userId },
      data: { read: true },
    });

    return NextResponse.json({ message: "Notification marked as read" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "UPDATE_ERROR" }, { status: 500 });
  }
}

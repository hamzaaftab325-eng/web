import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { getAccessToken, getRefreshToken } from "@/lib/auth-cookies";

/**
 * GET /api/notifications — list current user's notifications.
 * Supports ?unread=true to get only unread notifications.
 */
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get("unread") === "true";
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));

    const notifications = await db.notification.findMany({
      where: {
        userId: payload.userId,
        ...(unreadOnly && { read: false }),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const unreadCount = await db.notification.count({
      where: { userId: payload.userId, read: false },
    });

    return NextResponse.json({
      notifications: notifications.map(n => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        link: n.link,
        read: n.read,
        createdAt: n.createdAt.toISOString(),
      })),
      unreadCount,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "FETCH_ERROR" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth-guard";

/**
 * PUT /api/notifications/read-all — mark all notifications as read.
 *
 * SECURITY: Auth via requireUser (access-token only). Refresh tokens are NEVER
 * accepted as fallback auth.
 */
export async function PUT(request: NextRequest) {
  try {
    const auth = await requireUser(request);
    if (auth instanceof NextResponse) return auth;

    await db.notification.updateMany({
      where: { userId: auth.id, read: false },
      data: { read: true },
    });

    return NextResponse.json({ message: "All notifications marked as read" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json(
      { error: message, code: "UPDATE_ERROR" },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth-guard";

/**
 * PUT /api/notifications/[id]/read — mark a single notification as read.
 *
 * SECURITY: Auth via requireUser (access-token only). Refresh tokens are NEVER
 * accepted as fallback auth.
 *
 * The `updateMany` with `userId` in the where clause prevents IDOR — a user
 * cannot mark another user's notification as read.
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireUser(request);
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    await db.notification.updateMany({
      where: { id, userId: auth.id },
      data: { read: true },
    });

    return NextResponse.json({ message: "Notification marked as read" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json(
      { error: message, code: "UPDATE_ERROR" },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/cron/cleanup
 *
 * Cron job — runs daily at 4:30 AM PKT (23:30 UTC).
 * Purges expired rows from UsedResetToken (single-use JWT blacklist).
 *
 * Protected by CRON_SECRET env var (Bearer auth).
 */

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const usedTokens = await db.usedResetToken.deleteMany({ where: { expiresAt: { lt: now } } });

    // eslint-disable-next-line no-console
    console.info(`[cron] cleanup: deleted ${usedTokens.count} expired reset tokens`);

    return NextResponse.json({
      ok: true,
      deleted: {
        usedResetTokens: usedTokens.count,
      },
    });
  } catch (error) {
    console.error("[cron] cleanup error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
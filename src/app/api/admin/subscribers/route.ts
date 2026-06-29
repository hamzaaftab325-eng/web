import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";

/**
 * GET /api/admin/subscribers — list all email subscribers (admin only).
 * Supports ?search= and pagination.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(500, Math.max(1, parseInt(searchParams.get("limit") ?? "200", 10)));

    const where = search ? { email: { contains: search, mode: "insensitive" as const } } : {};

    const [subscribers, total] = await Promise.all([
      db.emailSubscriber.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.emailSubscriber.count({ where }),
    ]);

    return NextResponse.json({
      subscribers: subscribers.map(s => ({
        id: s.id, email: s.email, source: s.source,
        promoCode: s.promoCode,
        createdAt: s.createdAt.toISOString().split("T")[0],
      })),
      total, page, limit,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "FETCH_ERROR" }, { status: 500 });
  }
}

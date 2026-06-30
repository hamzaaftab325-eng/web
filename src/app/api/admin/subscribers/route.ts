import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";

/**
 * GET /api/admin/subscribers — list all email subscribers (admin only).
 * Supports ?search=, ?source= (segmentation), and pagination.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const sourceFilter = searchParams.get("source");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(500, Math.max(1, parseInt(searchParams.get("limit") ?? "200", 10)));

    const where: Record<string, unknown> = {};
    if (search) where.email = { contains: search, mode: "insensitive" as const };
    if (sourceFilter && sourceFilter !== "all") where.source = sourceFilter;

    const [subscribers, total] = await Promise.all([
      db.emailSubscriber.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.emailSubscriber.count({ where }),
    ]);

    // Get source breakdown for segmentation
    const sourceCounts = await db.emailSubscriber.groupBy({
      by: ["source"],
      _count: { id: true },
    });

    return NextResponse.json({
      subscribers: subscribers.map(s => ({
        id: s.id, email: s.email, source: s.source,
        promoCode: s.promoCode,
        createdAt: s.createdAt.toISOString().split("T")[0],
      })),
      total, page, limit,
      sources: sourceCounts.map(s => ({ source: s.source, count: s._count.id })),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "FETCH_ERROR" }, { status: 500 });
  }
}

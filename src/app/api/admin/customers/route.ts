import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";

/**
 * GET /api/admin/customers — list all users with order counts (admin only).
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get("limit") ?? "100", 10)));

    const where = search
      ? { OR: [{ email: { contains: search, mode: "insensitive" as const } }, { firstName: { contains: search, mode: "insensitive" as const } }, { lastName: { contains: search, mode: "insensitive" as const } }] }
      : {};

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true, email: true, firstName: true, lastName: true, phone: true,
          role: true, isActive: true, createdAt: true,
          _count: { select: { orders: true } },
        },
      }),
      db.user.count({ where }),
    ]);

    return NextResponse.json({
      customers: users.map(u => ({
        id: u.id, email: u.email, firstName: u.firstName, lastName: u.lastName,
        phone: u.phone, role: u.role, isActive: u.isActive,
        createdAt: u.createdAt.toISOString().split("T")[0],
        orderCount: u._count.orders,
      })),
      total, page, limit,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "FETCH_ERROR" }, { status: 500 });
  }
}

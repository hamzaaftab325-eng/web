import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";

/**
 * GET /api/admin/orders — list orders with search, filter, pagination.
 * Query params: page, limit, status, search, dateFrom, dateTo
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
    const status = searchParams.get("status") ?? "all";
    const search = searchParams.get("search") ?? "";
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const where: Record<string, unknown> = {};
    if (status !== "all") where.status = status;
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    if (dateFrom || dateTo) {
      const dateRange: Record<string, Date> = {};
      if (dateFrom) dateRange.gte = new Date(dateFrom);
      if (dateTo) { const end = new Date(dateTo); end.setHours(23, 59, 59, 999); dateRange.lte = end; }
      where.createdAt = dateRange;
    }

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          items: { select: { id: true } },
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
      }),
      db.order.count({ where }),
    ]);

    return NextResponse.json({
      orders: orders.map(o => ({
        id: o.id, orderNumber: o.orderNumber, date: o.createdAt.toISOString().split("T")[0],
        status: o.status, total: Number(o.total), email: o.email,
        paymentMethod: o.paymentMethod, paymentStatus: o.paymentStatus,
        itemCount: o.items.length,
        customer: o.user ? { id: o.user.id, name: `${o.user.firstName} ${o.user.lastName}`, email: o.user.email } : null,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "FETCH_ERROR" }, { status: 500 });
  }
}

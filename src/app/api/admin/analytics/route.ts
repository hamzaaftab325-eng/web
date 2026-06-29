import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { getAccessToken } from "@/lib/auth-cookies";

export async function GET(request: NextRequest) {
  try {
    const token = getAccessToken(request);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = verifyToken(token);
    if (payload.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") ?? "30d";
    const days = range === "7d" ? 7 : range === "90d" ? 90 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [orders, products, topProducts, pageViews, searchLogs] = await Promise.all([
      db.order.findMany({
        where: { createdAt: { gte: startDate } },
        orderBy: { createdAt: "asc" },
        select: { id: true, total: true, status: true, createdAt: true, items: { select: { quantity: true } } },
      }),
      db.product.findMany({ where: { isActive: true }, include: { _count: { select: { orderItems: true } } }, orderBy: { sortOrder: "asc" } }),
      db.orderItem.groupBy({
        by: ["productSlug", "productName"],
        _sum: { quantity: true },
        _avg: { price: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 10,
      }),
      db.pageView.count({ where: { createdAt: { gte: startDate } } }),
      db.searchLog.findMany({ take: 20, orderBy: { createdAt: "desc" }, select: { query: true, resultsCount: true } }),
    ]);

    // Group orders by date for chart
    const salesByDate: Record<string, { revenue: number; orders: number }> = {};
    orders.forEach(o => {
      const date = o.createdAt.toISOString().split("T")[0];
      if (!salesByDate[date]) salesByDate[date] = { revenue: 0, orders: 0 };
      salesByDate[date].revenue += Number(o.total);
      salesByDate[date].orders += 1;
    });

    return NextResponse.json({
      sales: Object.entries(salesByDate).map(([date, data]) => ({ date, ...data })),
      totalRevenue: orders.reduce((s, o) => s + Number(o.total), 0),
      totalOrders: orders.length,
      avgOrderValue: orders.length > 0 ? orders.reduce((s, o) => s + Number(o.total), 0) / orders.length : 0,
      topProducts: topProducts.map(p => ({ name: p.productName, slug: p.productSlug, quantity: p._sum.quantity ?? 0, revenue: (p._sum.quantity ?? 0) * Number(p._avg.price ?? 0) })),
      totalProducts: products.length,
      totalPageViews: pageViews,
      searchTerms: searchLogs.map(s => ({ query: s.query, results: s.resultsCount ?? 0 })),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed" }, { status: 500 });
  }
}

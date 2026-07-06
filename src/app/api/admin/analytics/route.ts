import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";

/**
 * GET /api/admin/analytics — order-based analytics data.
 * Query params: range (7d, 30d, 90d), detail (overview, revenue)
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") ?? "30d";
    const detail = searchParams.get("detail") ?? "overview";
    const days = range === "7d" ? 7 : range === "90d" ? 90 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    if (detail === "revenue") {
      // Revenue by category
      const orderItems = await db.orderItem.findMany({
        where: { order: { createdAt: { gte: startDate }, status: { not: "cancelled" } } },
        include: { product: { include: { category: true } } },
      });
      const byCategory: Record<string, number> = {};
      orderItems.forEach(item => {
        const cat = item.product?.category?.name ?? "Uncategorized";
        byCategory[cat] = (byCategory[cat] ?? 0) + Number(item.price) * item.quantity;
      });
      return NextResponse.json({
        byCategory: Object.entries(byCategory).map(([category, revenue]) => ({ category, revenue })).sort((a, b) => b.revenue - a.revenue),
      });
    }

    // Default: overview — order-based analytics
    const [orders, products, topProducts, recentOrders] = await Promise.all([
      db.order.findMany({
        where: { createdAt: { gte: startDate } },
        orderBy: { createdAt: "asc" },
        select: { id: true, total: true, status: true, createdAt: true, userId: true, email: true, orderNumber: true, items: { select: { quantity: true, productSlug: true, productName: true, price: true } } },
      }),
      db.product.findMany({ where: { isActive: true }, include: { _count: { select: { orderItems: true } } }, orderBy: { sortOrder: "asc" } }),
      db.orderItem.groupBy({
        by: ["productSlug", "productName"],
        _sum: { quantity: true },
        _avg: { price: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 10,
      }),
      db.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        where: { createdAt: { gte: startDate } },
        include: {
          user: { select: { firstName: true, lastName: true, email: true } },
          items: { select: { id: true } },
        },
      }),
    ]);

    // Revenue by collection — batch query
    const allOrderItemSlugs = [...new Set(orders.flatMap(o => o.items.map(i => i.productSlug)))];
    const productsWithCollections = await db.product.findMany({
      where: { slug: { in: allOrderItemSlugs } },
      select: { slug: true, collections: { include: { collection: { select: { name: true } } } } },
    });
    const slugToCollections = new Map(productsWithCollections.map(p => [p.slug, p.collections.map(pc => pc.collection.name)]));

    const collectionRevenue: Record<string, number> = {};
    for (const order of orders) {
      for (const item of order.items) {
        const collectionNames = slugToCollections.get(item.productSlug) ?? [];
        for (const name of collectionNames) {
          collectionRevenue[name] = (collectionRevenue[name] ?? 0) + Number(item.price) * item.quantity;
        }
      }
    }

    // 15.4: Day-of-week heatmap
    const dayOfWeekRevenue: Record<number, { revenue: number; orders: number }> = {};
    for (let i = 0; i < 7; i++) dayOfWeekRevenue[i] = { revenue: 0, orders: 0 };
    orders.forEach(o => {
      const day = o.createdAt.getDay();
      dayOfWeekRevenue[day].revenue += Number(o.total);
      dayOfWeekRevenue[day].orders += 1;
    });
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    // 15.5: Customer LTV
    const customerOrders: Record<string, number[]> = {};
    orders.forEach(o => {
      if (o.userId) {
        if (!customerOrders[o.userId]) customerOrders[o.userId] = [];
        customerOrders[o.userId].push(Number(o.total));
      }
    });
    const customerLTVs = Object.values(customerOrders).map(totals => totals.reduce((s, t) => s + t, 0));
    const avgLTV = customerLTVs.length > 0 ? customerLTVs.reduce((s, t) => s + t, 0) / customerLTVs.length : 0;

    // 15.6: Repeat purchase rate
    const repeatCustomers = Object.values(customerOrders).filter(totals => totals.length > 1).length;
    const totalCustomers = Object.keys(customerOrders).length;
    const repeatPurchaseRate = totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;

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
      topProducts: topProducts.map(p => ({ productName: p.productName, productSlug: p.productSlug, quantity: p._sum.quantity ?? 0, revenue: (p._sum.quantity ?? 0) * Number(p._avg.price ?? 0) })),
      totalProducts: products.length,
      revenueByCollection: Object.entries(collectionRevenue).map(([name, revenue]) => ({ name, revenue })).sort((a, b) => b.revenue - a.revenue),
      dayOfWeek: dayNames.map((name, i) => ({ day: name, revenue: dayOfWeekRevenue[i].revenue, orders: dayOfWeekRevenue[i].orders })),
      avgCustomerLTV: Math.round(avgLTV),
      repeatPurchaseRate: Math.round(repeatPurchaseRate * 100) / 100,
      totalCustomers,
      repeatCustomers,
      recentOrders: recentOrders.map(o => ({
        id: o.id,
        orderNumber: o.orderNumber,
        date: o.createdAt.toISOString().split("T")[0],
        status: o.status,
        total: Number(o.total),
        customer: o.user ? `${o.user.firstName} ${o.user.lastName}`.trim() : "Guest",
        email: o.email,
        items: o.items.length,
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "FETCH_ERROR" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";

/**
 * GET /api/admin/analytics — comprehensive analytics data.
 * Query params: range (7d, 30d, 90d), detail (overview, pages, search, carts, revenue)
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

    if (detail === "pages") {
      // Page view breakdown by path
      const pageViews = await db.pageView.groupBy({
        by: ["path"],
        _count: { id: true },
        where: { createdAt: { gte: startDate } },
        orderBy: { _count: { id: "desc" } },
        take: 20,
      });
      const totalViews = await db.pageView.count({ where: { createdAt: { gte: startDate } } });
      return NextResponse.json({
        pageViews: pageViews.map(pv => ({ path: pv.path, views: pv._count.id })),
        totalViews,
      });
    }

    if (detail === "search") {
      // Search analytics
      const [searchLogs, topSearches, zeroResults] = await Promise.all([
        db.searchLog.findMany({
          where: { createdAt: { gte: startDate } },
          orderBy: { createdAt: "desc" },
          take: 50,
          select: { query: true, resultsCount: true, createdAt: true },
        }),
        db.searchLog.groupBy({
          by: ["query"],
          _count: { id: true },
          where: { createdAt: { gte: startDate } },
          orderBy: { _count: { id: "desc" } },
          take: 20,
        }),
        db.searchLog.findMany({
          where: { createdAt: { gte: startDate }, resultsCount: 0 },
          orderBy: { createdAt: "desc" },
          take: 20,
          select: { query: true },
        }),
      ]);
      return NextResponse.json({
        recentSearches: searchLogs.map(s => ({ query: s.query, results: s.resultsCount ?? 0, date: s.createdAt.toISOString().split("T")[0] })),
        topSearches: topSearches.map(s => ({ query: s.query, count: s._count.id })),
        zeroResultSearches: zeroResults.map(s => s.query),
        totalSearches: searchLogs.length,
      });
    }

    if (detail === "carts") {
      // Cart funnel
      const [addToCart, beginCheckout, purchase] = await Promise.all([
        db.cartEvent.count({ where: { eventType: "add_to_cart", createdAt: { gte: startDate } } }),
        db.cartEvent.count({ where: { eventType: "begin_checkout", createdAt: { gte: startDate } } }),
        db.cartEvent.count({ where: { eventType: "purchase", createdAt: { gte: startDate } } }),
      ]);
      const conversionRate = addToCart > 0 ? (purchase / addToCart) * 100 : 0;
      return NextResponse.json({
        funnel: { addToCart, beginCheckout, purchase },
        conversionRate: Math.round(conversionRate * 100) / 100,
        abandonmentRate: Math.round((100 - conversionRate) * 100) / 100,
      });
    }

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

    // Default: overview (existing behavior)
    const [orders, products, topProducts, pageViews, searchLogs, productViews, cartEvents] = await Promise.all([
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
      db.productView.groupBy({
        by: ["productSlug"],
        _count: { id: true },
        where: { createdAt: { gte: startDate } },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),
      db.cartEvent.groupBy({
        by: ["eventType"],
        _count: { id: true },
        where: { createdAt: { gte: startDate } },
      }),
    ]);

    const salesByDate: Record<string, { revenue: number; orders: number }> = {};
    orders.forEach(o => {
      const date = o.createdAt.toISOString().split("T")[0];
      if (!salesByDate[date]) salesByDate[date] = { revenue: 0, orders: 0 };
      salesByDate[date].revenue += Number(o.total);
      salesByDate[date].orders += 1;
    });

    const cartFunnel = cartEvents.reduce((acc, e) => {
      acc[e.eventType] = e._count.id;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      sales: Object.entries(salesByDate).map(([date, data]) => ({ date, ...data })),
      totalRevenue: orders.reduce((s, o) => s + Number(o.total), 0),
      totalOrders: orders.length,
      avgOrderValue: orders.length > 0 ? orders.reduce((s, o) => s + Number(o.total), 0) / orders.length : 0,
      topProducts: topProducts.map(p => ({ productName: p.productName, productSlug: p.productSlug, quantity: p._sum.quantity ?? 0, revenue: (p._sum.quantity ?? 0) * Number(p._avg.price ?? 0) })),
      mostViewedProducts: productViews.map(pv => ({ slug: pv.productSlug, views: pv._count.id })),
      totalProducts: products.length,
      totalPageViews: pageViews,
      searchTerms: searchLogs.map(s => ({ query: s.query, results: s.resultsCount ?? 0 })),
      cartFunnel: {
        addToCart: cartFunnel["add_to_cart"] ?? 0,
        beginCheckout: cartFunnel["begin_checkout"] ?? 0,
        purchase: cartFunnel["purchase"] ?? 0,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "FETCH_ERROR" }, { status: 500 });
  }
}

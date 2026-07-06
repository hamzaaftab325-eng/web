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
    const [orders, products, topProducts, pageViews, searchLogs, productViews, cartEvents, recentOrders] = await Promise.all([
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
      db.pageView.count({ where: { createdAt: { gte: startDate } } }),
      db.searchLog.findMany({ where: { createdAt: { gte: startDate } }, take: 20, orderBy: { createdAt: "desc" }, select: { query: true, resultsCount: true } }),
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

    // 15.1: View-to-purchase conversion rate
    const totalProductViews = productViews.reduce((sum, pv) => sum + pv._count.id, 0);
    const purchasedSlugs = new Set(orders.flatMap(o => o.items.map(i => i.productSlug)));
    const viewToPurchaseRate = totalProductViews > 0 ? (purchasedSlugs.size / totalProductViews) * 100 : 0;

    // 15.3: Revenue by collection — batch query (was N+1: one query per order item)
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
      // New analytics
      viewToPurchaseRate: Math.round(viewToPurchaseRate * 100) / 100,
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

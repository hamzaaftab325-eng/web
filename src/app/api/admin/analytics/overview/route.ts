import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;

    const [totalProducts, totalOrders, revenueAgg, totalCustomers, recentOrders, lowStockProducts] = await Promise.all([
      db.product.count({ where: { isActive: true } }),
      db.order.count(),
      db.order.aggregate({ _sum: { total: true } }),
      db.user.count({ where: { role: "customer" } }),
      db.order.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { items: true } }),
      db.product.findMany({ where: { isActive: true, stockQuantity: { lt: 5 } }, take: 5, orderBy: { stockQuantity: "asc" } }),
    ]);

    const totalRevenue = Number(revenueAgg._sum.total ?? 0);

    return NextResponse.json({
      totalProducts, totalOrders, totalRevenue, totalCustomers,
      recentOrders: recentOrders.map(o => ({ id: o.id, orderNumber: o.orderNumber, date: o.createdAt.toISOString().split("T")[0], status: o.status, total: Number(o.total) })),
      lowStockProducts: lowStockProducts.map(p => ({ id: p.id, name: p.name, slug: p.slug, stockQuantity: p.stockQuantity })),
    });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Failed" }, { status: 500 }); }
}

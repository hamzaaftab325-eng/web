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

    const [totalProducts, totalOrders, orders, totalCustomers, recentOrders, lowStockProducts] = await Promise.all([
      db.product.count({ where: { isActive: true } }),
      db.order.count(),
      db.order.findMany({ select: { total: true } }),
      db.user.count({ where: { role: "customer" } }),
      db.order.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { items: true } }),
      db.product.findMany({ where: { isActive: true, stockQuantity: { lt: 5 } }, take: 5, orderBy: { stockQuantity: "asc" } }),
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);

    return NextResponse.json({
      totalProducts, totalOrders, totalRevenue, totalCustomers,
      recentOrders: recentOrders.map(o => ({ id: o.id, orderNumber: o.orderNumber, date: o.createdAt.toISOString().split("T")[0], status: o.status, total: Number(o.total) })),
      lowStockProducts: lowStockProducts.map(p => ({ id: p.id, name: p.name, slug: p.slug, stockQuantity: p.stockQuantity })),
    });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Failed" }, { status: 500 }); }
}

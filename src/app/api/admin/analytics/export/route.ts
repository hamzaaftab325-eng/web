import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { formatPrice } from "@/lib/format/currency";

/**
 * GET /api/admin/analytics/export?type=sales|products|customers|search
 * Exports analytics data as CSV.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") ?? "sales";
  const days = 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  let csv = "";
  let filename = "";

  if (type === "sales") {
    const orders = await db.order.findMany({
      where: { createdAt: { gte: startDate } },
      orderBy: { createdAt: "desc" },
      include: { items: true, user: { select: { firstName: true, lastName: true, email: true } } },
    });
    csv = "Order Number,Date,Status,Payment Method,Payment Status,Customer,Email,Items,Subtotal,Shipping,Discount,Total\n";
    csv += orders.map(o => [
      o.orderNumber, o.createdAt.toISOString().split("T")[0], o.status, o.paymentMethod, o.paymentStatus,
      o.user ? `"${o.user.firstName} ${o.user.lastName}"` : `"Guest"`, o.email,
      o.items.length, Number(o.subtotal), Number(o.shippingCost), Number(o.discount), Number(o.total),
    ].join(",")).join("\n");
    filename = "sales";
  } else if (type === "products") {
    const products = await db.orderItem.groupBy({
      by: ["productSlug", "productName"],
      _sum: { quantity: true },
      _avg: { price: true },
      orderBy: { _sum: { quantity: "desc" } },
    });
    csv = "Product Name,Slug,Quantity Sold,Avg Price,Revenue\n";
    csv += products.map(p => [
      `"${p.productName}"`, p.productSlug, p._sum.quantity ?? 0, Number(p._avg.price ?? 0),
      (p._sum.quantity ?? 0) * Number(p._avg.price ?? 0),
    ].join(",")).join("\n");
    filename = "products";
  } else if (type === "customers") {
    const users = await db.user.findMany({
      where: { role: "customer" },
      select: { id: true, firstName: true, lastName: true, email: true, createdAt: true, orders: { select: { total: true } } },
    });
    csv = "Name,Email,Joined,Order Count,Total Spent\n";
    csv += users.map(u => {
      const totalSpent = u.orders.reduce((s, o) => s + Number(o.total), 0);
      return [`"${u.firstName} ${u.lastName}"`, u.email, u.createdAt.toISOString().split("T")[0], u.orders.length, totalSpent].join(",");
    }).join("\n");
    filename = "customers";
  } else if (type === "search") {
    const searches = await db.searchLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: { query: true, resultsCount: true, createdAt: true },
    });
    csv = "Search Query,Results,Date\n";
    csv += searches.map(s => [`"${s.query}"`, s.resultsCount ?? 0, s.createdAt.toISOString().split("T")[0]].join(",")).join("\n");
    filename = "search-terms";
  }

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}

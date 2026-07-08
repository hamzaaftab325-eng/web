import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { emailWrapper, statCardRow, dataTable } from "@/lib/email-wrapper";
import { getSiteUrl } from "@/lib/site-url";

/**
 * GET /api/cron/daily-order-digest
 *
 * Cron job — runs daily at 9:00 AM PKT (04:00 UTC).
 * Sends admin a beautiful email summary of yesterday's orders.
 *
 * Protected by CRON_SECRET env var.
 */

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  // Default-deny if CRON_SECRET is not set (same fix as low-stock-alerts)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const yesterdayStart = new Date(now);
    yesterdayStart.setUTCDate(now.getUTCDate() - 1);
    yesterdayStart.setUTCHours(19, 0, 0, 0); // 00:00 PKT = 19:00 UTC previous day
    const yesterdayEnd = new Date(yesterdayStart);
    yesterdayEnd.setUTCHours(yesterdayStart.getUTCHours() + 24);

    const dateLabel = yesterdayStart.toLocaleDateString("en-PK", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Karachi",
    });

    const orders = await db.order.findMany({
      where: { createdAt: { gte: yesterdayStart, lt: yesterdayEnd } },
      include: { items: true },
      orderBy: { createdAt: "asc" },
    });

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const statusBreakdown = orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const productSales: Record<string, { name: string; qty: number; revenue: number }> = {};
    for (const order of orders) {
      for (const item of order.items) {
        if (!productSales[item.productSlug]) {
          productSales[item.productSlug] = { name: item.productName, qty: 0, revenue: 0 };
        }
        productSales[item.productSlug].qty += item.quantity;
        productSales[item.productSlug].revenue += Number(item.price) * item.quantity;
      }
    }
    const topProducts = Object.values(productSales).sort((a, b) => b.qty - a.qty).slice(0, 5);

    const html = buildDigestEmail({
      dateLabel,
      totalOrders,
      totalRevenue,
      avgOrderValue,
      statusBreakdown,
      topProducts,
      orders,
    });

    const admins = await db.user.findMany({
      where: { role: "admin", isActive: true },
      select: { email: true, firstName: true },
    });

    if (admins.length === 0) {
      return NextResponse.json({ ok: true, message: "No admins to email" });
    }

    const subject = `📊 Daily Digest — ${totalOrders} orders · ₨${totalRevenue.toLocaleString()} · ${dateLabel}`;
    const results = await Promise.all(
      admins.map((admin) =>
        sendEmail({
          to: admin.email,
          subject,
          html: html.replace("{{ADMIN_NAME}}", admin.firstName),
        })
      )
    );

    const sent = results.filter(Boolean).length;
    console.warn(`[cron] Daily digest sent to ${sent}/${admins.length} admins`);

    return NextResponse.json({
      ok: true,
      date: dateLabel,
      totalOrders,
      totalRevenue,
      emailsSent: sent,
    });
  } catch (error) {
    console.error("[cron] Daily digest error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

function buildDigestEmail(params: {
  dateLabel: string;
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  statusBreakdown: Record<string, number>;
  topProducts: Array<{ name: string; qty: number; revenue: number }>;
  orders: Array<{ orderNumber: string; status: string; total: { toLocaleString: () => string } | number; email: string; createdAt: Date; items: Array<{ quantity: number; price: { toLocaleString: () => string } | number; productSlug: string; productName: string }> }>;
}): string {
  const { dateLabel, totalOrders, totalRevenue, avgOrderValue, statusBreakdown, topProducts, orders } = params;

  const hasOrders = totalOrders > 0;

  const statusRows = Object.entries(statusBreakdown).map(([status, count]) => [
    `<span style="text-transform:capitalize;">${status}</span>`,
    `<span style="badge badge-gold">${count}</span>`,
  ]);

  const productRows = topProducts.map((p, i) => [
    `${i + 1}. ${p.name}`,
    `${p.qty} sold`,
    `<strong>₨${p.revenue.toLocaleString()}</strong>`,
  ]);

  const orderRows = orders.map((o) => [
    `<code style="font-family:monospace;">${o.orderNumber}</code>`,
    o.email,
    `<span style="text-transform:capitalize;">${o.status}</span>`,
    `<strong>₨${Number(o.total).toLocaleString()}</strong>`,
  ]);

  const content = `
    <p style="font-size:14px;color:#6B5D4F;margin:0 0 4px;">Good morning, {{ADMIN_NAME}}.</p>
    <p style="font-size:15px;color:#1a1714;margin:0 0 24px;">Here's your summary for <strong>${dateLabel}</strong>.</p>

    ${statCardRow([
      { value: String(totalOrders), label: "Orders" },
      { value: `₨${totalRevenue.toLocaleString()}`, label: "Revenue", gold: true },
      { value: `₨${Math.round(avgOrderValue).toLocaleString()}`, label: "Avg Order" },
    ])}

    ${
      !hasOrders
        ? `<div class="empty-state">
            <p style="margin:0;font-size:15px;color:#6B5D4F;">No orders yesterday.</p>
            <p style="margin:8px 0 0;font-size:13px;color:#9B8D7A;">A quiet day at the atelier — maybe time to write a journal entry or share a new collection on Instagram?</p>
          </div>`
        : `
      <h3>Order Status Breakdown</h3>
      ${dataTable(["Status", "Count"], statusRows)}

      <h3>Top Products</h3>
      ${dataTable(["Product", "Quantity", "Revenue"], productRows)}

      <h3>All Orders (${orders.length})</h3>
      ${dataTable(["Order #", "Customer", "Status", "Total"], orderRows)}
    `
    }

    <hr class="divider" />

    <div style="text-align:center;">
      <a href="${getSiteUrl()}/admin/orders" class="button">View All Orders</a>
    </div>
  `;

  return emailWrapper(content);
}

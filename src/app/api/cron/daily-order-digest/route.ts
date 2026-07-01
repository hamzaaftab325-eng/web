import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";

/**
 * GET /api/cron/daily-order-digest
 *
 * Cron job — runs daily at 9:00 AM PKT (04:00 UTC).
 * Sends admin an email summary of yesterday's orders:
 *  - Total orders
 *  - Total revenue
 *  - Average order value
 *  - Order status breakdown
 *  - Top products sold
 *  - List of all orders with customer + total
 *
 * Protected by CRON_SECRET env var (Vercel sends this header automatically).
 */

export const dynamic = "force-dynamic";
export const maxDuration = 30; // 30 seconds max

export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron (not a random visitor)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Calculate yesterday's date range (PKT = UTC+5)
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

    // Fetch yesterday's orders
    const orders = await db.order.findMany({
      where: {
        createdAt: {
          gte: yesterdayStart,
          lt: yesterdayEnd,
        },
      },
      include: { items: true },
      orderBy: { createdAt: "asc" },
    });

    // Calculate summary stats
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Status breakdown
    const statusBreakdown = orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Top products by quantity
    const productSales: Record<string, { name: string; slug: string; qty: number; revenue: number }> = {};
    for (const order of orders) {
      for (const item of order.items) {
        const key = item.productSlug;
        if (!productSales[key]) {
          productSales[key] = { name: item.productName, slug: item.productSlug, qty: 0, revenue: 0 };
        }
        productSales[key].qty += item.quantity;
        productSales[key].revenue += Number(item.price) * item.quantity;
      }
    }
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    // Build email HTML
    const html = buildDigestEmail({
      dateLabel,
      totalOrders,
      totalRevenue,
      avgOrderValue,
      statusBreakdown,
      topProducts,
      orders,
    });

    // Fetch admin emails
    const admins = await db.user.findMany({
      where: { role: "admin", isActive: true },
      select: { email: true, firstName: true },
    });

    if (admins.length === 0) {
      console.warn("[cron] No admin users found — skipping email");
      return NextResponse.json({ ok: true, message: "No admins to email" });
    }

    // Send email to all admins
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
    console.log(`[cron] Daily digest sent to ${sent}/${admins.length} admins`);

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
  topProducts: Array<{ name: string; slug: string; qty: number; revenue: number }>;
  orders: Array<{ orderNumber: string; status: string; total: any; email: string; createdAt: Date; items: any[] }>;
}): string {
  const { dateLabel, totalOrders, totalRevenue, avgOrderValue, statusBreakdown, topProducts, orders } = params;

  const statusRows = Object.entries(statusBreakdown)
    .map(([status, count]) => `<tr><td style="padding:6px 0;text-transform:capitalize;">${status}</td><td style="text-align:right;font-weight:600;">${count}</td></tr>`)
    .join("");

  const productRows = topProducts
    .map(
      (p, i) =>
        `<tr><td style="padding:6px 0;">${i + 1}. ${p.name}</td><td style="text-align:right;">${p.qty} sold</td><td style="text-align:right;font-weight:600;">₨${p.revenue.toLocaleString()}</td></tr>`
    )
    .join("");

  const orderRows = orders
    .map(
      (o) =>
        `<tr><td style="padding:6px 0;font-family:monospace;">${o.orderNumber}</td><td>${o.email}</td><td style="text-transform:capitalize;">${o.status}</td><td style="text-align:right;font-weight:600;">₨${Number(o.total).toLocaleString()}</td></tr>`
    )
    .join("");

  const emptyMessage =
    totalOrders === 0
      ? `<div style="background:#FFF8E1;border:1px solid #FFE082;padding:16px;border-radius:4px;margin:16px 0;text-align:center;color:#6B5D4F;">No orders yesterday. A quiet day at the atelier — maybe time to write a journal entry?</div>`
      : "";

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;padding:0;background:#FAF7F0;font-family:Georgia,serif;color:#1a1714;">
<div style="max-width:600px;margin:0 auto;padding:24px;">
  <div style="text-align:center;padding:24px 0;border-bottom:1px solid #E8E0D5;">
    <div style="font-size:24px;font-weight:400;letter-spacing:-0.02em;">Aura Living</div>
    <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.15em;color:#D4AF37;margin-top:4px;">Daily Order Digest</div>
  </div>

  <div style="padding:24px 0;">
    <p style="font-size:14px;color:#6B5D4F;margin:0 0 4px;">Good morning, {{ADMIN_NAME}}.</p>
    <p style="font-size:15px;color:#1a1714;margin:0 0 24px;">Here's your summary for <strong>${dateLabel}</strong>.</p>

    <!-- Summary stats -->
    <table style="width:100%;border-collapse:collapse;margin:0 0 24px;">
      <tr>
        <td style="background:#F5EFE1;padding:16px;text-align:center;border-radius:4px 0 0 4px;">
          <div style="font-size:28px;font-weight:600;color:#1a1714;">${totalOrders}</div>
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#6B5D4F;margin-top:4px;">Orders</div>
        </td>
        <td style="background:#F5EFE1;padding:16px;text-align:center;">
          <div style="font-size:28px;font-weight:600;color:#D4AF37;">₨${totalRevenue.toLocaleString()}</div>
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#6B5D4F;margin-top:4px;">Revenue</div>
        </td>
        <td style="background:#F5EFE1;padding:16px;text-align:center;border-radius:0 4px 4px 0;">
          <div style="font-size:28px;font-weight:600;color:#1a1714;">₨${Math.round(avgOrderValue).toLocaleString()}</div>
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:#6B5D4F;margin-top:4px;">Avg Order</div>
        </td>
      </tr>
    </table>

    ${emptyMessage}

    ${
      totalOrders > 0
        ? `
    <!-- Status breakdown -->
    <h3 style="font-size:14px;font-weight:600;margin:24px 0 8px;color:#1a1714;">Order Status Breakdown</h3>
    <table style="width:100%;border-collapse:collapse;font-size:13px;color:#4A4A4A;">
      <thead><tr style="border-bottom:2px solid #E8E0D5;"><td style="padding:6px 0;text-transform:uppercase;font-size:11px;letter-spacing:0.08em;color:#718096;">Status</td><td style="text-align:right;text-transform:uppercase;font-size:11px;letter-spacing:0.08em;color:#718096;">Count</td></tr></thead>
      <tbody>${statusRows}</tbody>
    </table>

    <!-- Top products -->
    <h3 style="font-size:14px;font-weight:600;margin:24px 0 8px;color:#1a1714;">Top Products</h3>
    <table style="width:100%;border-collapse:collapse;font-size:13px;color:#4A4A4A;">
      <thead><tr style="border-bottom:2px solid #E8E0D5;"><td style="padding:6px 0;text-transform:uppercase;font-size:11px;letter-spacing:0.08em;color:#718096;">Product</td><td style="text-align:right;text-transform:uppercase;font-size:11px;letter-spacing:0.08em;color:#718096;">Qty</td><td style="text-align:right;text-transform:uppercase;font-size:11px;letter-spacing:0.08em;color:#718096;">Revenue</td></tr></thead>
      <tbody>${productRows}</tbody>
    </table>

    <!-- All orders -->
    <h3 style="font-size:14px;font-weight:600;margin:24px 0 8px;color:#1a1714;">All Orders</h3>
    <table style="width:100%;border-collapse:collapse;font-size:12px;color:#4A4A4A;">
      <thead><tr style="border-bottom:2px solid #E8E0D5;"><td style="padding:6px 0;text-transform:uppercase;font-size:11px;letter-spacing:0.08em;color:#718096;">Order #</td><td style="text-transform:uppercase;font-size:11px;letter-spacing:0.08em;color:#718096;">Customer</td><td style="text-transform:uppercase;font-size:11px;letter-spacing:0.08em;color:#718096;">Status</td><td style="text-align:right;text-transform:uppercase;font-size:11px;letter-spacing:0.08em;color:#718096;">Total</td></tr></thead>
      <tbody>${orderRows}</tbody>
    </table>
    `
        : ""
    }

    <div style="margin-top:32px;padding-top:16px;border-top:1px solid #E8E0D5;text-align:center;">
      <p style="font-size:12px;color:#718096;margin:0;">View full details in the <a href="https://aura-living-1.vercel.app/admin/orders" style="color:#D4AF37;text-decoration:none;">Admin Dashboard</a></p>
      <p style="font-size:11px;color:#A0AEC0;margin:8px 0 0;">Aura Living Atelier · Lahore, Pakistan</p>
    </div>
  </div>
</div>
</body></html>`;
}

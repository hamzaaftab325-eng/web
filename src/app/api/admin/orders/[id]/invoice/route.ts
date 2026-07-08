import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { escapeHtml, escapeHtmlFields } from "@/lib/escape-html";
import { formatPrice } from "@/lib/format/currency";

/**
 * GET /api/admin/orders/[id]/invoice — returns a printable HTML invoice.
 *
 * Security: every interpolation is HTML-escaped via `escapeHtml()` to prevent
 * stored XSS from customer-submitted address fields. A customer entering
 * `<img src=x onerror=...>` in shippingAddress.firstName cannot execute
 * scripts in the admin's browser when they open this invoice.
 *
 * Returns Content-Type: text/html so the browser renders it as a printable page.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: { items: true, user: { select: { firstName: true, lastName: true } } },
  });
  if (!order) {
    return NextResponse.json({ error: "Not found", code: "NOT_FOUND" }, { status: 404 });
  }

  // ─── Escape every customer-controllable field before interpolation ───
  const rawAddr = (order.shippingAddress ?? {}) as Record<string, unknown>;
  const addr = escapeHtmlFields(rawAddr);

  const customerFirstName = order.user ? escapeHtml(order.user.firstName) : addr.firstName ?? "";
  const customerLastName = order.user ? escapeHtml(order.user.lastName) : addr.lastName ?? "";

  const orderNumber = escapeHtml(order.orderNumber);
  const orderStatus = escapeHtml(order.status);
  const paymentMethod = escapeHtml(order.paymentMethod.toUpperCase());
  const paymentStatus = escapeHtml(order.paymentStatus);
  const orderDate = escapeHtml(order.createdAt.toISOString().split("T")[0]);

  const itemRows = order.items
    .map((item) => {
      const name = escapeHtml(item.productName);
      const qty = escapeHtml(String(item.quantity));
      const price = escapeHtml(formatPrice(Number(item.price)));
      const lineTotal = escapeHtml(formatPrice(Number(item.price) * item.quantity));
      return `<tr><td>${name}</td><td class="right">${qty}</td><td class="right">${price}</td><td class="right">${lineTotal}</td></tr>`;
    })
    .join("");

  const subtotal = formatPrice(Number(order.subtotal));
  const shipping = Number(order.shippingCost) === 0 ? "Free" : formatPrice(Number(order.shippingCost));
  const discount = Number(order.discount) > 0 ? formatPrice(Number(order.discount)) : null;
  const total = formatPrice(Number(order.total));

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Invoice ${orderNumber} — Aura Living</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Georgia, serif; color: #1a1714; background: #FAF7F0; padding: 40px 20px; }
  .invoice { max-width: 700px; margin: 0 auto; background: #fff; padding: 48px; border-radius: 4px; box-shadow: 0 2px 20px rgba(0,0,0,0.08); }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid #E8E0D5; }
  .brand { font-size: 28px; font-weight: 400; letter-spacing: -0.02em; }
  .brand span { color: #D4AF37; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; display: block; margin-top: 2px; }
  .invoice-meta { text-align: right; font-size: 13px; color: #718096; }
  .invoice-meta strong { color: #1a1714; font-size: 15px; }
  .section { margin-bottom: 24px; }
  .section h3 { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #D4AF37; margin-bottom: 8px; }
  .section p { font-size: 14px; line-height: 1.6; color: #4A4A4A; }
  table { width: 100%; border-collapse: collapse; margin: 16px 0; }
  th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #718096; padding: 8px 0; border-bottom: 2px solid #E8E0D5; }
  td { padding: 12px 0; font-size: 14px; border-bottom: 1px solid #F0EBE0; }
  .right { text-align: right; }
  .totals { margin-left: auto; width: 280px; margin-top: 16px; }
  .totals .row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
  .totals .total { font-size: 18px; font-weight: 600; padding-top: 12px; border-top: 2px solid #E8E0D5; margin-top: 8px; }
  .totals .total span:last-child { color: #D4AF37; }
  .footer { margin-top: 40px; padding-top: 24px; border-top: 1px solid #E8E0D5; font-size: 12px; color: #718096; text-align: center; }
  @media print { body { padding: 0; background: #fff; } .invoice { box-shadow: none; max-width: 100%; } }
</style>
</head>
<body>
<div class="invoice">
  <div class="header">
    <div class="brand">Aura<span>Living</span></div>
    <div class="invoice-meta">
      <strong>Invoice ${orderNumber}</strong><br>
      Date: ${orderDate}<br>
      Status: ${orderStatus}<br>
      Payment: ${paymentMethod} — ${paymentStatus}
    </div>
  </div>
  <div class="section">
    <h3>Bill To</h3>
    <p>${customerFirstName} ${customerLastName}<br>
    ${addr.street ?? ""}<br>
    ${addr.city ?? ""}, ${addr.state ?? ""} ${addr.zip ?? ""}<br>
    ${addr.country ?? ""}<br>
    ${addr.phone ?? ""}</p>
  </div>
  <table>
    <thead><tr><th>Item</th><th class="right">Qty</th><th class="right">Price</th><th class="right">Total</th></tr></thead>
    <tbody>
      ${itemRows}
    </tbody>
  </table>
  <div class="totals">
    <div class="row"><span>Subtotal</span><span>${subtotal}</span></div>
    <div class="row"><span>Shipping</span><span>${shipping}</span></div>
    ${discount ? `<div class="row"><span>Discount</span><span>−${discount}</span></div>` : ""}
    <div class="row total"><span>Total</span><span>${total}</span></div>
  </div>
  <div class="footer">
    Aura Living · Considered home, sourced slowly<br>
    This is a computer-generated invoice. No signature required.
  </div>
</div>
<script>window.print()</script>
</body>
</html>`;

  return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
}

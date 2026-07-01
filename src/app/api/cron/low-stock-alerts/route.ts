import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";

/**
 * GET /api/cron/low-stock-alerts
 *
 * Cron job — runs daily at 10:00 AM PKT (05:00 UTC).
 * Sends admin an email listing all products with stock below threshold.
 *
 * Thresholds:
 *  - stockQuantity <= 3  → LOW (warning)
 *  - stockQuantity = 0   → OUT (critical)
 *
 * Only sends email if there ARE low-stock products (no spam on good days).
 *
 * Protected by CRON_SECRET env var.
 */

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const LOW_STOCK_THRESHOLD = 3;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date().toLocaleDateString("en-PK", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "Asia/Karachi",
    });

    // Fetch all products with their stock
    const products = await db.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
        stockQuantity: true,
        price: true,
        category: { select: { name: true } },
        variants: { select: { label: true, stockQuantity: true } },
      },
      orderBy: { stockQuantity: "asc" },
    });

    // Filter to low-stock and out-of-stock
    const outOfStock = products.filter((p) => p.stockQuantity <= 0);
    const lowStock = products.filter(
      (p) => p.stockQuantity > 0 && p.stockQuantity <= LOW_STOCK_THRESHOLD
    );

    // Also check variant stock
    const lowStockVariants = products
      .filter((p) => p.variants.length > 0)
      .flatMap((p) =>
        p.variants
          .filter((v) => v.stockQuantity <= LOW_STOCK_THRESHOLD)
          .map((v) => ({
            productName: p.name,
            productSlug: p.slug,
            variantLabel: v.label,
            stock: v.stockQuantity,
          }))
      );

    const totalLowStock = outOfStock.length + lowStock.length + lowStockVariants.length;

    // If no low-stock items, don't send email (avoid daily spam)
    if (totalLowStock === 0) {
      console.log("[cron] No low-stock items — skipping email");
      return NextResponse.json({
        ok: true,
        message: "All products well-stocked — no alert needed",
        outOfStock: 0,
        lowStock: 0,
      });
    }

    // Build email HTML
    const html = buildLowStockEmail({
      dateLabel: today,
      outOfStock,
      lowStock,
      lowStockVariants,
      threshold: LOW_STOCK_THRESHOLD,
    });

    // Fetch admin emails
    const admins = await db.user.findMany({
      where: { role: "admin", isActive: true },
      select: { email: true, firstName: true },
    });

    if (admins.length === 0) {
      return NextResponse.json({ ok: true, message: "No admins to email" });
    }

    const subject =
      outOfStock.length > 0
        ? `🔴 Stock Alert — ${outOfStock.length} out of stock, ${lowStock.length} low`
        : `🟡 Stock Alert — ${lowStock.length} products running low`;

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
    console.log(`[cron] Low-stock alert sent to ${sent}/${admins.length} admins (${totalLowStock} items need attention)`);

    return NextResponse.json({
      ok: true,
      date: today,
      outOfStock: outOfStock.length,
      lowStock: lowStock.length,
      lowStockVariants: lowStockVariants.length,
      emailsSent: sent,
    });
  } catch (error) {
    console.error("[cron] Low-stock alert error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

function buildLowStockEmail(params: {
  dateLabel: string;
  outOfStock: Array<{ name: string; slug: string; price: any; category: { name: string } | null }>;
  lowStock: Array<{ name: string; slug: string; stockQuantity: number; price: any; category: { name: string } | null }>;
  lowStockVariants: Array<{ productName: string; productSlug: string; variantLabel: string; stock: number }>;
  threshold: number;
}): string {
  const { dateLabel, outOfStock, lowStock, lowStockVariants, threshold } = params;

  const outOfStockRows = outOfStock
    .map(
      (p) =>
        `<tr><td style="padding:8px 0;"><a href="https://aura-living-1.vercel.app/product/${p.slug}" style="color:#1a1714;text-decoration:none;font-weight:500;">${p.name}</a><br><span style="font-size:11px;color:#718096;">${p.category?.name ?? "Uncategorized"} · ₨${Number(p.price).toLocaleString()}</span></td><td style="text-align:right;color:#B0413E;font-weight:600;">OUT OF STOCK</td></tr>`
    )
    .join("");

  const lowStockRows = lowStock
    .map(
      (p) =>
        `<tr><td style="padding:8px 0;"><a href="https://aura-living-1.vercel.app/product/${p.slug}" style="color:#1a1714;text-decoration:none;font-weight:500;">${p.name}</a><br><span style="font-size:11px;color:#718096;">${p.category?.name ?? "Uncategorized"} · ₨${Number(p.price).toLocaleString()}</span></td><td style="text-align:right;color:#C28A2B;font-weight:600;">${p.stockQuantity} left</td></tr>`
    )
    .join("");

  const variantRows = lowStockVariants
    .map(
      (v) =>
        `<tr><td style="padding:8px 0;">${v.productName}<br><span style="font-size:11px;color:#718096;">Variant: ${v.variantLabel}</span></td><td style="text-align:right;color:#C28A2B;font-weight:600;">${v.stock} left</td></tr>`
    )
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;padding:0;background:#FAF7F0;font-family:Georgia,serif;color:#1a1714;">
<div style="max-width:600px;margin:0 auto;padding:24px;">
  <div style="text-align:center;padding:24px 0;border-bottom:1px solid #E8E0D5;">
    <div style="font-size:24px;font-weight:400;letter-spacing:-0.02em;">Aura Living</div>
    <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.15em;color:#D4AF37;margin-top:4px;">Stock Alert</div>
  </div>

  <div style="padding:24px 0;">
    <p style="font-size:14px;color:#6B5D4F;margin:0 0 4px;">Good morning, {{ADMIN_NAME}}.</p>
    <p style="font-size:15px;color:#1a1714;margin:0 0 24px;">Here's your stock summary for <strong>${dateLabel}</strong>.</p>

    ${
      outOfStock.length > 0
        ? `
    <h3 style="font-size:14px;font-weight:600;margin:0 0 8px;color:#B0413E;">🔴 Out of Stock (${outOfStock.length})</h3>
    <table style="width:100%;border-collapse:collapse;font-size:13px;color:#4A4A4A;margin-bottom:24px;">
      <tbody>${outOfStockRows}</tbody>
    </table>
    `
        : ""
    }

    ${
      lowStock.length > 0
        ? `
    <h3 style="font-size:14px;font-weight:600;margin:0 0 8px;color:#C28A2B;">🟡 Low Stock — ${threshold} or fewer left (${lowStock.length})</h3>
    <table style="width:100%;border-collapse:collapse;font-size:13px;color:#4A4A4A;margin-bottom:24px;">
      <tbody>${lowStockRows}</tbody>
    </table>
    `
        : ""
    }

    ${
      lowStockVariants.length > 0
        ? `
    <h3 style="font-size:14px;font-weight:600;margin:0 0 8px;color:#C28A2B;">🟡 Low-Stock Variants (${lowStockVariants.length})</h3>
    <table style="width:100%;border-collapse:collapse;font-size:13px;color:#4A4A4A;margin-bottom:24px;">
      <tbody>${variantRows}</tbody>
    </table>
    `
        : ""
    }

    <div style="background:#F5EFE1;padding:16px;border-radius:4px;margin:16px 0;">
      <p style="font-size:12px;color:#6B5D4F;margin:0;text-align:center;">Restock these items in the <a href="https://aura-living-1.vercel.app/admin/products" style="color:#D4AF37;text-decoration:none;font-weight:500;">Admin Dashboard → Products</a></p>
    </div>

    <div style="margin-top:24px;padding-top:16px;border-top:1px solid #E8E0D5;text-align:center;">
      <p style="font-size:11px;color:#A0AEC0;margin:0;">Aura Living Atelier · Lahore, Pakistan</p>
    </div>
  </div>
</div>
</body></html>`;
}

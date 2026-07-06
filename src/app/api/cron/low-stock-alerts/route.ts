import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { emailWrapper, dataTable } from "@/lib/email-wrapper";

/**
 * GET /api/cron/low-stock-alerts
 *
 * Cron job — runs daily at 10:00 AM PKT (05:00 UTC).
 * Sends admin a beautiful email listing low-stock + out-of-stock products.
 *
 * Protected by CRON_SECRET env var.
 */

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const LOW_STOCK_THRESHOLD = 3;

export async function GET(request: NextRequest) {
  // Bug #16 fix: default-deny if CRON_SECRET is not set.
  // Was: if (cronSecret && ...) — when CRON_SECRET was unset, anyone could trigger.
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
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

    const outOfStock = products.filter((p) => p.stockQuantity <= 0);
    const lowStock = products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= LOW_STOCK_THRESHOLD);
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

    if (totalLowStock === 0) {
      console.warn("[cron] No low-stock items — skipping email");
      return NextResponse.json({
        ok: true,
        message: "All products well-stocked — no alert needed",
        outOfStock: 0,
        lowStock: 0,
      });
    }

    const html = buildLowStockEmail({
      dateLabel: today,
      outOfStock,
      lowStock,
      lowStockVariants,
      threshold: LOW_STOCK_THRESHOLD,
    });

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
    console.warn(`[cron] Low-stock alert sent to ${sent}/${admins.length} admins (${totalLowStock} items need attention)`);

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
  outOfStock: Array<{ name: string; slug: string; price: { toLocaleString: () => string } | number; category: { name: string } | null }>;
  lowStock: Array<{ name: string; slug: string; stockQuantity: number; price: { toLocaleString: () => string } | number; category: { name: string } | null }>;
  lowStockVariants: Array<{ productName: string; productSlug: string; variantLabel: string; stock: number }>;
  threshold: number;
}): string {
  const { dateLabel, outOfStock, lowStock, lowStockVariants, threshold } = params;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aura-living-1.vercel.app';

  const outOfStockRows = outOfStock.map((p) => [
    `<a href="${siteUrl}/product/${p.slug}" style="color:#1a1714;text-decoration:none;font-weight:500;">${p.name}</a><br><span style="font-size:11px;color:#718096;">${p.category?.name ?? "Uncategorized"} · ₨${Number(p.price).toLocaleString()}</span>`,
    `<span class="alert-critical">OUT OF STOCK</span>`,
  ]);

  const lowStockRows = lowStock.map((p) => [
    `<a href="${siteUrl}/product/${p.slug}" style="color:#1a1714;text-decoration:none;font-weight:500;">${p.name}</a><br><span style="font-size:11px;color:#718096;">${p.category?.name ?? "Uncategorized"} · ₨${Number(p.price).toLocaleString()}</span>`,
    `<span class="alert-warning">${p.stockQuantity} left</span>`,
  ]);

  const variantRows = lowStockVariants.map((v) => [
    `${v.productName}<br><span style="font-size:11px;color:#718096;">Variant: ${v.variantLabel}</span>`,
    `<span class="alert-warning">${v.stock} left</span>`,
  ]);

  const content = `
    <p style="font-size:14px;color:#6B5D4F;margin:0 0 4px;">Good morning, {{ADMIN_NAME}}.</p>
    <p style="font-size:15px;color:#1a1714;margin:0 0 24px;">Here's your stock summary for <strong>${dateLabel}</strong>.</p>

    ${outOfStock.length > 0 ? `<h3 style="color:#B0413E;">🔴 Out of Stock (${outOfStock.length})</h3>${dataTable(["Product", "Status"], outOfStockRows)}` : ""}

    ${lowStock.length > 0 ? `<h3 style="color:#C28A2B;">🟡 Low Stock — ${threshold} or fewer left (${lowStock.length})</h3>${dataTable(["Product", "Status"], lowStockRows)}` : ""}

    ${lowStockVariants.length > 0 ? `<h3 style="color:#C28A2B;">🟡 Low-Stock Variants (${lowStockVariants.length})</h3>${dataTable(["Product + Variant", "Status"], variantRows)}` : ""}

    <hr class="divider" />

    <div style="background:#F5EFE1;padding:16px;border-radius:4px;text-align:center;margin:16px 0;">
      <p style="margin:0;font-size:13px;color:#6B5D4F;">Restock these items in the admin dashboard</p>
    </div>

    <div style="text-align:center;">
      <a href="${siteUrl}/admin/products" class="button">Manage Products</a>
    </div>
  `;

  return emailWrapper(content);
}

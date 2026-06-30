import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";

/** GET /api/admin/products/export — CSV export of all products */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const products = await db.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { category: true, images: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });

  const headers = ["id", "slug", "name", "price", "compareAtPrice", "stockQuantity", "inStock", "isActive", "featured", "category", "badge", "materials", "dimensions", "image"];
  const rows = products.map(p => [
    p.id, p.slug, p.name, String(Number(p.price)),
    p.compareAtPrice ? String(Number(p.compareAtPrice)) : "",
    String(p.stockQuantity), String(p.inStock), String(p.isActive), String(p.featured),
    p.category?.name ?? "", p.badge ?? "",
    p.materials.join("; "), p.dimensions ?? "",
    p.images[0]?.url ?? "",
  ].map(c => `"${c.replace(/"/g, '""')}"`).join(","));

  const csv = headers.join(",") + "\n" + rows.join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="products-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}

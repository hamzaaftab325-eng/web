import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/products/sale
 *
 * Returns all active products currently on sale — i.e. where
 * `compareAtPrice` is set AND strictly greater than `price`.
 *
 * Results are sorted by discount percentage descending:
 *   (compareAtPrice - price) / compareAtPrice
 *
 * Response shape matches /api/products so the same ProductCard /
 * ProductGrid components render without modification.
 */
export async function GET() {
  try {
    // Prisma cannot compare two columns directly in a `where` clause
    // (compareAtPrice > price), so we fetch the candidate set
    // (active + compareAtPrice not null) and filter + sort in JS.
    const products = await db.product.findMany({
      where: {
        isActive: true,
        compareAtPrice: { not: null },
      },
      include: {
        images: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: { sortOrder: "asc" } },
        category: true,
      },
    });

    const onSale = products
      .filter((p) => {
        if (!p.compareAtPrice) return false;
        // Convert Prisma Decimal to Number for comparison
        // (Decimal > Decimal can be unreliable in Prisma)
        return Number(p.compareAtPrice) > Number(p.price);
      })
      .map((p) => {
        const price = Number(p.price);
        const compareAtPrice = p.compareAtPrice ? Number(p.compareAtPrice) : 0;
        const discountPct =
          compareAtPrice > 0 ? (compareAtPrice - price) / compareAtPrice : 0;
        return {
          id: p.id,
          slug: p.slug,
          name: p.name,
          subtitle: p.subtitle ?? undefined,
          description: p.description,
          longDescription: p.longDescription ?? undefined,
          price,
          compareAtPrice: p.compareAtPrice ? compareAtPrice : undefined,
          category: p.category?.slug ?? "",
          images: p.images.map((img) => img.url),
          badge: p.badge,
          inStock: p.inStock && (p.stockQuantity ?? 0) > 0,
          variants: p.variants.map((v) => ({
            id: v.id,
            label: v.label,
            swatch: v.swatchColor ?? undefined,
          })),
          materials: p.materials,
          dimensions: p.dimensions ?? undefined,
          careInstructions: p.careInstructions ?? undefined,
          featured: p.featured,
          _discountPct: discountPct,
        };
      })
      .sort((a, b) => b._discountPct - a._discountPct)
      .map(({ _discountPct: _ignored, ...rest }) => rest);

    return NextResponse.json({ products: onSale });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed",
        code: "FETCH_ERROR",
      },
      { status: 500 }
    );
  }
}

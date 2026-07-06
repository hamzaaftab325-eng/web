import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/** GET /api/wishlist/public?userId=xxx — public wishlist view */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) return NextResponse.json({ error: "User ID required", code: "VALIDATION_ERROR" }, { status: 400 });

    // Verify the user exists and is active
    const user = await db.user.findUnique({ where: { id: userId }, select: { isActive: true, firstName: true } });
    if (!user || !user.isActive) return NextResponse.json({ error: "Wishlist not found", code: "NOT_FOUND" }, { status: 404 });

    // Get wishlist items
    const wishlist = await db.wishlist.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
    if (wishlist.length === 0) return NextResponse.json({ products: [], ownerName: user.firstName });

    // Fetch product details for wishlist items
    const slugs = wishlist.map(w => w.productSlug);
    const products = await db.product.findMany({
      where: { slug: { in: slugs }, isActive: true },
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    });

    return NextResponse.json({
      ownerName: user.firstName,
      products: products.map(p => ({
        id: p.id, slug: p.slug, name: p.name, price: Number(p.price),
        images: p.images.map(i => i.url), badge: p.badge, inStock: p.inStock,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Failed", code: "FETCH_ERROR" }, { status: 500 });
  }
}

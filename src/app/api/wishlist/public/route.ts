import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";

/**
 * GET /api/wishlist/public?shareId=xxx — public wishlist view via share token.
 *
 * Phase 2E: Now accepts a `shareId` (random CUID from WishlistShare table)
 * instead of `userId` (which was reversible base64 — leaked user IDs).
 *
 * For backward compatibility, also accepts `userId` (deprecated — will be
 * removed in a future phase). New share links always use shareId.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get("shareId");
    const legacyUserId = searchParams.get("userId");

    let userId: string | null = null;

    if (shareId) {
      // Modern flow: look up WishlistShare by shareId
      const share = await db.wishlistShare.findUnique({
        where: { shareId },
        select: { userId: true, expiresAt: true },
      });

      if (!share) {
        return NextResponse.json(
          { error: "Wishlist not found", code: "NOT_FOUND" },
          { status: 404 },
        );
      }

      // Check if share link has expired
      if (share.expiresAt && share.expiresAt < new Date()) {
        return NextResponse.json(
          { error: "This share link has expired", code: "EXPIRED" },
          { status: 410 },
        );
      }

      userId = share.userId;
    } else if (legacyUserId) {
      // Legacy flow: direct userId (deprecated)
      userId = legacyUserId;
    } else {
      return NextResponse.json(
        { error: "Share ID or User ID required", code: "VALIDATION_ERROR" },
        { status: 400 },
      );
    }

    // Verify the user exists and is active
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { isActive: true, firstName: true },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: "Wishlist not found", code: "NOT_FOUND" },
        { status: 404 },
      );
    }

    // Get wishlist items
    const wishlist = await db.wishlist.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (wishlist.length === 0) {
      return NextResponse.json({ products: [], ownerName: user.firstName });
    }

    // Fetch product details for wishlist items
    const slugs = wishlist.map((w) => w.productSlug);
    const products = await db.product.findMany({
      where: { slug: { in: slugs }, isActive: true },
      include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    });

    return NextResponse.json({
      ownerName: user.firstName,
      products: products.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        price: Number(p.price),
        images: p.images.map((i) => i.url),
        badge: p.badge,
        inStock: p.inStock,
      })),
    });
  } catch {
    return NextResponse.json(
      { error: "Failed", code: "FETCH_ERROR" },
      { status: 500 },
    );
  }
}

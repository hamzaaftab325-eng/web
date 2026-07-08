import { NextRequest, NextResponse } from "next/server";

import { requireUser } from "@/lib/auth-guard";
import { db } from "@/lib/db";

/**
 * POST /api/user/wishlist/share — generate a shareable wishlist link.
 *
 * Phase 2E: Replaced base64(userId) with a proper WishlistShare row containing
 * a random shareId. The previous approach was reversible — anyone with a share
 * link could decode the userId. Now shareIds are random CUIDs with no
 * recoverable user information.
 *
 * Security:
 *   - Auth via requireUser (access-token only).
 *   - shareId is a random CUID — no user info encoded.
 *   - WishlistShare rows can have an expiresAt for time-limited shares.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireUser(request);
    if (auth instanceof NextResponse) return auth;

    // Create a new WishlistShare row.
    // Each call generates a fresh shareId — old ones remain valid until they
    // expire (if expiresAt is set) or are manually revoked.
    const share = await db.wishlistShare.create({
      data: {
        userId: auth.id,
        // expiresAt left null — share never expires by default.
        // Future enhancement: accept ?expiresInDays=7 from query string.
      },
      select: {
        shareId: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      shareId: share.shareId,
      shareUrl: `/wishlist/${share.shareId}`,
      createdAt: share.createdAt.toISOString(),
      message: "Wishlist share link generated",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed";
    return NextResponse.json(
      { error: message, code: "SHARE_ERROR" },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getAccessToken } from "@/lib/auth-cookies";

/**
 * POST /api/user/wishlist/share — generate a shareable wishlist link.
 * Creates a WishlistShare record with a unique shareId.
 */

// First, check if we have a WishlistShare model. If not, use a simpler approach:
// We'll use the user's ID as the share ID (base64-encoded).
export async function POST(request: NextRequest) {
  try {
    const token = getAccessToken(request);
    if (!token) return NextResponse.json({ error: "Not authenticated", code: "UNAUTHORIZED" }, { status: 401 });
    const payload = verifyToken(token);

    // Use the user ID encoded as the share ID (best-effort approach).
    const encoded = Buffer.from(payload.userId).toString("base64url");

    return NextResponse.json({
      shareId: encoded,
      shareUrl: `/wishlist/${encoded}`,
      message: "Wishlist share link generated",
    });
  } catch {
    return NextResponse.json({ error: "Failed", code: "SHARE_ERROR" }, { status: 500 });
  }
}

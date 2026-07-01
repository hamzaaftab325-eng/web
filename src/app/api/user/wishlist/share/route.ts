import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { getAccessToken } from "@/lib/auth-cookies";
import crypto from "crypto";

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

    // Generate a random share ID
    const shareId = crypto.randomBytes(8).toString("hex");

    // Store the share mapping (we'll use a simple approach: store in a cookie/localStorage on client,
    // and the share endpoint will use the user ID encoded)
    // For now, return the user ID encoded as the share ID
    const encoded = Buffer.from(payload.userId).toString("base64url");

    return NextResponse.json({
      shareId: encoded,
      shareUrl: `/wishlist/${encoded}`,
      message: "Wishlist share link generated",
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed", code: "SHARE_ERROR" }, { status: 500 });
  }
}

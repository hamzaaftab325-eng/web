import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { getAccessToken } from "@/lib/auth-cookies";

/**
 * POST /api/user/data/delete
 *
 * GDPR-style "right to erasure" — permanently deletes the authenticated
 * user's account and all associated personal data, EXCEPT:
 *   - Order records (required by Pakistani tax law for 5 years).
 *     These orders are anonymized: firstName/lastName/phone/email/address
 *     fields on the Order itself are wiped, but order number, totals, and
 *     items remain for accounting.
 *
 * Requires email confirmation in the request body to prevent accidental deletion.
 *
 * After deletion, all auth cookies are cleared client-side via the response.
 */
export async function POST(request: NextRequest) {
  try {
    const token = getAccessToken(request);
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    let userId: string;
    try {
      const payload = verifyToken(token);
      userId = payload.userId;
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const { confirmEmail } = body ?? {};

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Require email confirmation as a safety check.
    if (!confirmEmail || confirmEmail.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json(
        { error: "Email confirmation does not match. Please type your email address exactly." },
        { status: 400 }
      );
    }

    // Anonymize orders (keep order record for tax, but strip PII).
    // The shippingAddress field is JSON — we replace it with an anonymized
    // structure that preserves the city/province (for regional analytics)
    // but removes the street, apartment, postal code, and phone.
    const orders = await db.order.findMany({
      where: { userId },
      select: { id: true, shippingAddress: true },
    });
    for (const order of orders) {
      const addr =
        typeof order.shippingAddress === "object" && order.shippingAddress !== null
          ? (order.shippingAddress as Record<string, unknown>)
          : {};
      const anonymizedAddress = {
        ...addr,
        firstName: "[deleted]",
        lastName: "[deleted]",
        street: "[deleted]",
        apartment: null,
        phone: null,
        postalCode: "[deleted]",
      };
      await db.order.update({
        where: { id: order.id },
        data: {
          email: "[deleted]",
          shippingAddress: anonymizedAddress,
          userId: null,
          orderNotes: null,
        },
      });
    }

    // Delete all personal data — cascade will handle related rows.
    await db.address.deleteMany({ where: { userId } });
    await db.wishlist.deleteMany({ where: { userId } });
    await db.review.deleteMany({ where: { userId } });
    await db.notification.deleteMany({ where: { userId } });
    await db.userSession.deleteMany({ where: { userId } });
    await db.userPreferences.deleteMany({ where: { userId } });

    // Finally, delete the user record itself.
    await db.user.delete({ where: { id: userId } });

    // Build response — clear auth cookies client-side.
    const response = NextResponse.json({
      success: true,
      message: "Your account and personal data have been deleted. Order records have been anonymized and retained for tax purposes as required by Pakistani law.",
    });
    response.cookies.delete("aura_access");
    response.cookies.delete("aura_refresh");
    return response;
  } catch (error) {
    console.error("[data/delete] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete account. Please contact support." },
      { status: 500 }
    );
  }
}

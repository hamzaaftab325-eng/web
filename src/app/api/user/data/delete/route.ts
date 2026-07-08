import { NextRequest, NextResponse } from "next/server";

import { requireUser, invalidateUserCache } from "@/lib/auth-guard";
import { db } from "@/lib/db";

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
 * Security:
 *   - Auth via requireUser (access-token only).
 *   - All deletions wrapped in a single `db.$transaction` — if any step
 *     fails (network blip, FK surprise), the entire operation rolls back
 *     and the user is left in a consistent state.
 *   - User cache invalidated after deletion to prevent stale auth.
 *
 * After deletion, all auth cookies are cleared client-side via the response.
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireUser(request);
    if (auth instanceof NextResponse) return auth;

    const userId = auth.id;

    const body = await request.json();
    const { confirmEmail } = body ?? {};

    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!confirmEmail || confirmEmail.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json(
        { error: "Email confirmation does not match. Please type your email address exactly." },
        { status: 400 }
      );
    }

    const orders = await db.order.findMany({
      where: { userId },
      select: { id: true, shippingAddress: true },
    });

    await db.$transaction(async (tx) => {
      // 1. Anonymize each order's PII fields (keep the order row for tax law).
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
        await tx.order.update({
          where: { id: order.id },
          data: {
            email: "[deleted]",
            shippingAddress: anonymizedAddress,
            userId: null,
            orderNotes: null,
          },
        });
      }

      // 2. Delete all personal data — cascade will handle related rows.
      // NOTE: Reviews are NOT deleted — Phase 2B changed Review.user to
      // onDelete: SetNull, so reviews are preserved with userId set to null
      // (anonymized author). This is the GDPR-correct behavior: keep the
      // review content for other shoppers, just disassociate it from the user.
      await tx.address.deleteMany({ where: { userId } });
      await tx.wishlist.deleteMany({ where: { userId } });
      await tx.notification.deleteMany({ where: { userId } });
      await tx.userSession.deleteMany({ where: { userId } });
      await tx.userPreferences.deleteMany({ where: { userId } });

      // 3. Finally, delete the user record itself.
      // Reviews will be auto-anonymized via onDelete: SetNull on Review.user.
      // OrderItems will be auto-nullified via onDelete: SetNull on OrderItem.product
      // (if the user's products are deleted — they typically aren't, but the
      // safety net is there).
      await tx.user.delete({ where: { id: userId } });
    });

    invalidateUserCache(userId);

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

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { getAccessToken } from "@/lib/auth-cookies";

/**
 * GET /api/user/data/export
 *
 * GDPR-style data export — returns ALL personal data we hold about the
 * authenticated user as a downloadable JSON file. Includes:
 *  - Profile (name, email, phone, dates)
 *  - Addresses
 *  - Orders + items
 *  - Reviews
 *  - Wishlist
 *  - Notifications
 *  - Preferences
 *
 * Does NOT include password hash or session tokens.
 */
export async function GET(request: NextRequest) {
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

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        addresses: true,
        orders: { include: { items: true } },
        reviews: true,
        wishlist: true,
        notifications: true,
        preferences: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Strip sensitive fields.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...safeUser } = user;

    const exportData = {
      exportedAt: new Date().toISOString(),
      note: "This file contains all personal data Aura Living holds about you. To request deletion, use the /api/user/data/delete endpoint or visit Settings → Privacy.",
      user: {
        id: safeUser.id,
        email: safeUser.email,
        firstName: safeUser.firstName,
        lastName: safeUser.lastName,
        phone: safeUser.phone,
        role: safeUser.role,
        createdAt: safeUser.createdAt,
        updatedAt: safeUser.updatedAt,
      },
      addresses: safeUser.addresses.map((a) => ({
        id: a.id,
        label: a.label,
        firstName: a.firstName,
        lastName: a.lastName,
        street: a.street,
        apartment: a.apartment,
        city: a.city,
        province: a.province,
        postalCode: a.postalCode,
        country: a.country,
        phone: a.phone,
        isDefault: a.isDefault,
        createdAt: a.createdAt,
      })),
      orders: safeUser.orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        total: o.total,
        subtotal: o.subtotal,
        shippingCost: o.shippingCost,
        tax: o.tax,
        createdAt: o.createdAt,
        updatedAt: o.updatedAt,
        items: o.items.map((it) => ({
          id: it.id,
          productId: it.productId,
          productName: it.productName,
          productSlug: it.productSlug,
          price: it.price,
          quantity: it.quantity,
          productImage: it.productImage,
          variantLabel: it.variantLabel,
        })),
      })),
      reviews: safeUser.reviews.map((r) => ({
        id: r.id,
        productId: r.productId,
        rating: r.rating,
        title: r.title,
        body: r.body,
        status: r.status,
        createdAt: r.createdAt,
      })),
      wishlist: safeUser.wishlist.map((w) => ({
        userId: w.userId,
        productSlug: w.productSlug,
        createdAt: w.createdAt,
      })),
      notifications: safeUser.notifications.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        read: n.read,
        createdAt: n.createdAt,
      })),
      preferences: safeUser.preferences
        ? {
            newsletter: safeUser.preferences.newsletter,
            newArrivals: safeUser.preferences.newArrivals,
            saleAlerts: safeUser.preferences.saleAlerts,
            orderUpdates: safeUser.preferences.orderUpdates,
            stylePreferences: safeUser.preferences.stylePreferences,
            budgetMin: safeUser.preferences.budgetMin,
            budgetMax: safeUser.preferences.budgetMax,
          }
        : null,
    };

    const json = JSON.stringify(exportData, null, 2);
    const filename = `aura-living-data-export-${new Date().toISOString().slice(0, 10)}.json`;

    return new NextResponse(json, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error("[data/export] Error:", error);
    return NextResponse.json(
      { error: "Failed to export data. Please try again." },
      { status: 500 }
    );
  }
}

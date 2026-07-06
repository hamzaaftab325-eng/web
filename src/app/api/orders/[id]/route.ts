import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth-guard";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // Use requireUser (DB-backed isActive check) instead of verifyToken (JWT-only).
    // This prevents a deactivated/banned user with a still-valid access token
    // from fetching order details until the token expires. Consistent with
    // GET /api/orders which already uses requireUser.
    const auth = await requireUser(request);
    if (auth instanceof NextResponse) return auth;

    const order = await db.order.findFirst({
      where: { id, userId: auth.id },
      include: { items: true },
    });

    if (!order) return NextResponse.json({ error: "Order not found", code: "NOT_FOUND" }, { status: 404 });

    return NextResponse.json({
      id: order.id, orderNumber: order.orderNumber, date: order.createdAt.toISOString().split("T")[0],
      status: order.status, items: order.items.map(i => ({ key: i.id, productId: i.productId ?? "", slug: i.productSlug, name: i.productName, image: i.productImage ?? "", price: Number(i.price), variantLabel: i.variantLabel ?? undefined, quantity: i.quantity })),
      subtotal: Number(order.subtotal), discount: Number(order.discount), shipping: Number(order.shippingCost), tax: Number(order.tax), total: Number(order.total),
      shippingAddress: order.shippingAddress as Record<string, string>,
      trackingNumber: order.trackingNumber ?? undefined, carrier: order.carrier ?? undefined, estimatedDelivery: order.estimatedDelivery?.toISOString().split("T")[0] ?? undefined,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "FETCH_ERROR" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth-guard";
import { parseAddress } from "@/lib/validators/address";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await requireUser(request);
    if (auth instanceof NextResponse) return auth;

    const order = await db.order.findFirst({
      where: { id, userId: auth.id },
      include: { items: true },
    });

    if (!order) return NextResponse.json({ error: "Order not found", code: "NOT_FOUND" }, { status: 404 });

    // Phase 6B: Use parseAddress instead of `as Record<string, string>` cast.
    // Returns the typed address if valid, or a permissive fallback if not.
    const shippingAddress = parseAddress(order.shippingAddress) ?? (order.shippingAddress as Record<string, string> ?? {});

    return NextResponse.json({
      id: order.id, orderNumber: order.orderNumber, date: order.createdAt.toISOString().split("T")[0],
      status: order.status, items: order.items.map(i => ({ key: i.id, productId: i.productId ?? "", slug: i.productSlug, name: i.productName, image: i.productImage ?? "", price: Number(i.price), variantLabel: i.variantLabel ?? undefined, quantity: i.quantity })),
      subtotal: Number(order.subtotal), discount: Number(order.discount), shipping: Number(order.shippingCost), tax: Number(order.tax), total: Number(order.total),
      shippingAddress,
      trackingNumber: order.trackingNumber ?? undefined, carrier: order.carrier ?? undefined, estimatedDelivery: order.estimatedDelivery?.toISOString().split("T")[0] ?? undefined,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "FETCH_ERROR" }, { status: 500 });
  }
}

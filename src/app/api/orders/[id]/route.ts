import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { getAccessToken } from "@/lib/auth-cookies";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = getAccessToken(request);
    if (!token) return NextResponse.json({ error: "Not authenticated", code: "UNAUTHORIZED" }, { status: 401 });
    const payload = verifyToken(token);

    const order = await db.order.findFirst({
      where: { id, userId: payload.userId },
      include: { items: true },
    });

    if (!order) return NextResponse.json({ error: "Order not found", code: "NOT_FOUND" }, { status: 404 });

    return NextResponse.json({
      id: order.id, orderNumber: order.orderNumber, date: order.createdAt.toISOString().split("T")[0],
      status: order.status, items: order.items.map(i => ({ key: i.id, productId: i.productId ?? "", slug: i.productSlug, name: i.productName, image: i.productImage ?? "", price: Number(i.price), variantLabel: i.variantLabel ?? undefined, quantity: i.quantity })),
      subtotal: Number(order.subtotal), shipping: Number(order.shippingCost), tax: Number(order.tax), total: Number(order.total),
      shippingAddress: order.shippingAddress as Record<string, string>,
      trackingNumber: order.trackingNumber ?? undefined, carrier: order.carrier ?? undefined, estimatedDelivery: order.estimatedDelivery?.toISOString().split("T")[0] ?? undefined,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "FETCH_ERROR" }, { status: 500 });
  }
}

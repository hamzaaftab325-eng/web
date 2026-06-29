import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { getAccessToken } from "@/lib/auth-cookies";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = getAccessToken(request);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = verifyToken(token);
    if (payload.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const order = await db.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({
      ...order,
      date: order.createdAt.toISOString().split("T")[0],
      subtotal: Number(order.subtotal), shippingCost: Number(order.shippingCost),
      discount: Number(order.discount), tax: Number(order.tax), total: Number(order.total),
      items: order.items.map(i => ({ ...i, price: Number(i.price) })),
    });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Failed" }, { status: 500 }); }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const token = getAccessToken(request);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = verifyToken(token);
    if (payload.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const body = await request.json();
    const order = await db.order.update({
      where: { id },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.trackingNumber !== undefined && { trackingNumber: body.trackingNumber }),
        ...(body.carrier !== undefined && { carrier: body.carrier }),
        ...(body.paymentStatus && { paymentStatus: body.paymentStatus }),
      },
    });
    return NextResponse.json({ order, message: "Order updated" });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Failed" }, { status: 500 }); }
}

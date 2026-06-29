import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { createNotification } from "@/lib/notifications";

const OrderUpdateSchema = z.object({
  status: z.enum(["processing", "packed", "shipped", "delivered", "cancelled"]).optional(),
  trackingNumber: z.string().max(100).nullable().optional(),
  carrier: z.string().max(100).nullable().optional(),
  paymentStatus: z.enum(["pending", "paid", "refunded", "failed"]).optional(),
  orderNotes: z.string().max(2000).nullable().optional(),
});

/**
 * GET /api/admin/orders/[id] — fetch a single order with items (admin only).
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    const order = await db.order.findUnique({ where: { id }, include: { items: true } });
    if (!order) return NextResponse.json({ error: "Not found", code: "NOT_FOUND" }, { status: 404 });

    return NextResponse.json({
      ...order,
      date: order.createdAt.toISOString().split("T")[0],
      subtotal: Number(order.subtotal), shippingCost: Number(order.shippingCost),
      discount: Number(order.discount), tax: Number(order.tax), total: Number(order.total),
      items: order.items.map(i => ({ ...i, price: Number(i.price) })),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "FETCH_ERROR" }, { status: 500 });
  }
}

/**
 * PUT /api/admin/orders/[id] — update order status, tracking, or payment (admin only).
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    const body = await request.json();
    const parsed = OrderUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation failed", code: "VALIDATION_ERROR" }, { status: 400 });
    }
    const data = parsed.data;

    const order = await db.order.update({
      where: { id },
      data: {
        ...(data.status && { status: data.status }),
        ...(data.trackingNumber !== undefined && { trackingNumber: data.trackingNumber }),
        ...(data.carrier !== undefined && { carrier: data.carrier }),
        ...(data.paymentStatus && { paymentStatus: data.paymentStatus }),
        ...(data.orderNotes !== undefined && { orderNotes: data.orderNotes }),
      },
    });

    // Notify the customer if their order status changed
    if (data.status && order.userId) {
      const statusMessages: Record<string, { title: string; message: string }> = {
        processing: { title: "Order Processing", message: `Your order ${order.orderNumber} is now being processed.` },
        packed: { title: "Order Packed", message: `Your order ${order.orderNumber} has been packed and is ready for shipment.` },
        shipped: { title: "Order Shipped", message: `Your order ${order.orderNumber} has been shipped${order.trackingNumber ? ` — tracking: ${order.trackingNumber}` : ""}.` },
        delivered: { title: "Order Delivered", message: `Your order ${order.orderNumber} has been delivered. Enjoy!` },
        cancelled: { title: "Order Cancelled", message: `Your order ${order.orderNumber} has been cancelled. Contact us if you have questions.` },
      };
      const msg = statusMessages[data.status];
      if (msg) {
        await createNotification({
          userId: order.userId,
          type: "order_status",
          title: msg.title,
          message: msg.message,
          link: "/account/orders",
        });
      }
    }

    return NextResponse.json({ order, message: "Order updated" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "UPDATE_ERROR" }, { status: 500 });
  }
}

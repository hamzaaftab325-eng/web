import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { getAccessToken } from "@/lib/auth-cookies";
import { createNotification, notifyAdmins } from "@/lib/notifications";
import { formatPrice } from "@/lib/format/currency";

/**
 * GET /api/orders — user's order history (requires auth)
 * POST /api/orders — create new order (COD checkout)
 */

export async function GET(request: NextRequest) {
  try {
    const token = getAccessToken(request);
    if (!token) return NextResponse.json({ error: "Not authenticated", code: "UNAUTHORIZED" }, { status: 401 });
    const payload = verifyToken(token);
    
    const orders = await db.order.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });

    return NextResponse.json(orders.map(o => ({
      id: o.id, orderNumber: o.orderNumber, date: o.createdAt.toISOString().split("T")[0],
      status: o.status, items: o.items.map(i => ({ key: i.id, productId: i.productId ?? "", slug: i.productSlug, name: i.productName, image: i.productImage ?? "", price: Number(i.price), variantLabel: i.variantLabel ?? undefined, quantity: i.quantity })),
      subtotal: Number(o.subtotal), shipping: Number(o.shippingCost), tax: Number(o.tax), total: Number(o.total),
      shippingAddress: o.shippingAddress as Record<string, string>,
      trackingNumber: o.trackingNumber ?? undefined, carrier: o.carrier ?? undefined, estimatedDelivery: o.estimatedDelivery?.toISOString().split("T")[0] ?? undefined,
    })));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "FETCH_ERROR" }, { status: 500 });
  }
}

const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(), slug: z.string(), name: z.string(), image: z.string(),
    price: z.number(), variantLabel: z.string().optional(), quantity: z.number().min(1),
  })),
  shippingAddress: z.object({
    firstName: z.string(), lastName: z.string(), street: z.string(),
    city: z.string(), state: z.string(), zip: z.string(), country: z.string(), phone: z.string(),
  }),
  shippingMethod: z.string(),
  promoCode: z.string().optional(),
  orderNotes: z.string().optional(),
  email: z.string().email(),
  paymentMethod: z.string().default("cod"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input", code: "VALIDATION_ERROR" }, { status: 400 });

    const { items, shippingAddress, shippingMethod, promoCode, orderNotes, email, paymentMethod } = parsed.data;

    // Calculate totals
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    let discount = 0;
    let shippingCost = 150; // Default PKR shipping

    // Validate promo code
    if (promoCode) {
      const promo = await db.promoCode.findUnique({ where: { code: promoCode.toUpperCase() } });
      if (promo && promo.isActive && (!promo.expiresAt || promo.expiresAt > new Date()) && (!promo.maxUses || promo.usesCount < promo.maxUses)) {
        if (promo.type === "percent") discount = subtotal * Number(promo.value) / 100;
        else if (promo.type === "fixed") discount = Number(promo.value);
        else if (promo.type === "shipping") shippingCost = 0;
        
        // Increment uses
        await db.promoCode.update({ where: { id: promo.id }, data: { usesCount: { increment: 1 } } });
      }
    }

    // Free shipping threshold
    const shippingMethodData = await db.shippingMethod.findFirst({ where: { code: shippingMethod } });
    if (shippingMethodData) {
      shippingCost = Number(shippingMethodData.baseCost);
      if (shippingMethodData.freeThreshold && subtotal >= Number(shippingMethodData.freeThreshold)) {
        shippingCost = 0;
      }
    }

    const tax = 0; // No tax for Pakistan
    const total = Math.max(0, subtotal - discount + shippingCost + tax);

    // Get user ID if authenticated
    let userId: string | undefined;
    const token = getAccessToken(request);
    if (token) {
      try { const payload = verifyToken(token); userId = payload.userId; } catch {}
    }

    // Generate order number
    const orderNumber = `AURA-${Date.now().toString(36).toUpperCase().slice(-8)}`;

    // Create order in transaction
    const order = await db.order.create({
      data: {
        orderNumber,
        userId,
        email,
        status: "processing",
        subtotal,
        discount,
        shippingCost,
        tax,
        total,
        promoCode: promoCode?.toUpperCase() ?? null,
        shippingMethod,
        shippingAddress: shippingAddress as never,
        orderNotes: orderNotes ?? null,
        paymentMethod,
        paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
        items: {
          create: items.map(i => ({
            productId: i.productId || null,
            productSlug: i.slug,
            productName: i.name,
            productImage: i.image,
            price: i.price,
            quantity: i.quantity,
            variantLabel: i.variantLabel ?? null,
          })),
        },
      },
      include: { items: true },
    });

    // Decrement stock
    for (const item of items) {
      if (item.productId) {
        await db.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { decrement: item.quantity } },
        }).catch(() => {});
      }
    }

    // Send notifications
    // 1. Notify the customer (if logged in)
    if (userId) {
      await createNotification({
        userId,
        type: "order_status",
        title: "Order Placed",
        message: `Your order ${order.orderNumber} has been received and is being processed.`,
        link: "/account/orders",
      });
    }
    // 2. Notify all admins
    await notifyAdmins(
      "new_order",
      "New Order",
      `Order ${order.orderNumber} placed by ${email} — ${formatPrice(total)}`,
      `/admin/orders/${order.id}`
    );

    return NextResponse.json({
      orderNumber: order.orderNumber,
      order: {
        id: order.id, orderNumber: order.orderNumber, date: order.createdAt.toISOString().split("T")[0],
        status: order.status, total: Number(order.total),
      },
      message: "Order placed successfully",
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Order failed", code: "ORDER_ERROR" }, { status: 500 });
  }
}

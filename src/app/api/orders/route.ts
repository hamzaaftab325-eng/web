import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { getAccessToken } from "@/lib/auth-cookies";
import { createNotification, notifyAdmins } from "@/lib/notifications";
import { formatPrice } from "@/lib/format/currency";
import { sendEmail } from "@/lib/email";
import { orderConfirmationEmail } from "@/lib/email-templates";
import { requireUser } from "@/lib/auth-guard";

/**
 * GET /api/orders — user's order history (requires auth, paginated)
 * POST /api/orders — create new order (COD checkout)
 */

export async function GET(request: NextRequest) {
  try {
    const auth = await requireUser(request);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where: { userId: auth.id },
        orderBy: { createdAt: "desc" },
        include: { items: true },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.order.count({ where: { userId: auth.id } }),
    ]);

    return NextResponse.json({
      orders: orders.map(o => ({
        id: o.id, orderNumber: o.orderNumber, date: o.createdAt.toISOString().split("T")[0],
        status: o.status, items: o.items.map(i => ({ key: i.id, productId: i.productId ?? "", slug: i.productSlug, name: i.productName, image: i.productImage ?? "", price: Number(i.price), variantLabel: i.variantLabel ?? undefined, quantity: i.quantity })),
        subtotal: Number(o.subtotal), discount: Number(o.discount), shipping: Number(o.shippingCost), tax: Number(o.tax), total: Number(o.total),
        shippingAddress: (o.shippingAddress ?? {}) as Record<string, string>,
        trackingNumber: o.trackingNumber ?? undefined, carrier: o.carrier ?? undefined, estimatedDelivery: o.estimatedDelivery?.toISOString().split("T")[0] ?? undefined,
      })),
      total, page, limit, totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[orders GET] failed:", error);
    return NextResponse.json({ error: "Failed to load orders. Please try again.", code: "FETCH_ERROR" }, { status: 500 });
  }
}

const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(), slug: z.string(), name: z.string(), image: z.string(),
    price: z.number(), variantLabel: z.string().optional(), quantity: z.number().min(1),
  })).min(1, "Cart cannot be empty"),
  shippingAddress: z.object({
    firstName: z.string(), lastName: z.string(), street: z.string(),
    city: z.string(), state: z.string(), zip: z.string(), country: z.string(), phone: z.string(),
    province: z.string().optional(), postalCode: z.string().optional(),
    apartment: z.string().optional(),
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

    // Validate prices against the database — never trust client-supplied prices
    const productSlugs = items.map(i => i.slug);
    const dbProducts = await db.product.findMany({
      where: { slug: { in: productSlugs } },
      select: { id: true, slug: true, price: true, compareAtPrice: true, stockQuantity: true, isActive: true, name: true },
    });
    const productMap = new Map(dbProducts.map(p => [p.slug, p]));

    for (const item of items) {
      const product = productMap.get(item.slug);
      if (!product) {
        return NextResponse.json({ error: `Product "${item.name}" not found`, code: "PRODUCT_NOT_FOUND" }, { status: 400 });
      }
      if (!product.isActive) {
        return NextResponse.json({ error: `Product "${item.name}" is no longer available`, code: "PRODUCT_UNAVAILABLE" }, { status: 400 });
      }
      if (product.stockQuantity > 0 && product.stockQuantity < item.quantity) {
        return NextResponse.json(
          { error: `Only ${product.stockQuantity} of "${item.name}" available`, code: "INSUFFICIENT_STOCK" },
          { status: 400 }
        );
      }
      const dbPrice = Number(product.price);
      const dbCompareAt = product.compareAtPrice ? Number(product.compareAtPrice) : 0;
      item.price = (dbCompareAt > 0 && dbCompareAt < dbPrice) ? dbCompareAt : dbPrice;
      item.productId = product.id;
    }

    const normalizedAddress = {
      ...shippingAddress,
      province: shippingAddress.province ?? shippingAddress.state ?? "",
      postalCode: shippingAddress.postalCode ?? shippingAddress.zip ?? "",
      state: shippingAddress.state ?? shippingAddress.province ?? "",
      zip: shippingAddress.zip ?? shippingAddress.postalCode ?? "",
    };

    const settingsRecords = await db.setting.findMany();
    const settings: Record<string, string> = {};
    for (const s of settingsRecords) settings[s.key] = s.value;
    const orderPrefix = settings.orderNumberPrefix ?? "AURA";
    const defaultShipping = Number(settings.defaultShippingCost ?? "150");
    const taxRate = Number(settings.taxRate ?? "0") / 100;

    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    let discount = 0;
    let shippingCost = defaultShipping;

    let promoId: string | null = null;
    let promoMaxUses: number | null = null;
    let flashSaleId: string | null = null;
    let flashSaleMaxUses: number | null = null;
    if (promoCode) {
      const upperCode = promoCode.toUpperCase();
      // First try the PromoCode table (existing logic)
      const promo = await db.promoCode.findUnique({ where: { code: upperCode } });
      if (promo && promo.isActive && (!promo.expiresAt || promo.expiresAt > new Date()) && (!promo.maxUses || promo.usesCount < promo.maxUses)) {
        if (promo.minOrder && subtotal < Number(promo.minOrder)) {
          return NextResponse.json(
            { error: `Minimum order of Rs ${Number(promo.minOrder).toLocaleString()} required for this promo code`, code: "PROMO_MIN_ORDER" },
            { status: 400 }
          );
        }
        if (promo.type === "percent") discount = subtotal * Number(promo.value) / 100;
        else if (promo.type === "fixed") discount = Number(promo.value);
        else if (promo.type === "shipping") shippingCost = 0;
        discount = Math.min(discount, subtotal);
        promoId = promo.id;
        promoMaxUses = promo.maxUses;
      } else {
        // Fallback: check if it's a FlashSale promo code
        const flashSale = await db.flashSale.findFirst({
          where: {
            promoCode: upperCode,
            isActive: true,
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
            ...(promoMaxUses !== null ? { usesCount: { lt: promoMaxUses } } : {}),
          },
        });
        if (flashSale && flashSale.discountPercent) {
          if (flashSale.maxUses && flashSale.usesCount >= flashSale.maxUses) {
            return NextResponse.json(
              { error: "This flash sale code has reached its customer limit", code: "FLASH_SALE_EXHAUSTED" },
              { status: 409 }
            );
          }
          discount = subtotal * Number(flashSale.discountPercent) / 100;
          discount = Math.min(discount, subtotal);
          flashSaleId = flashSale.id;
          flashSaleMaxUses = flashSale.maxUses;
        }
      }
    }

    const shippingMethodData = await db.shippingMethod.findFirst({ where: { code: shippingMethod } });
    if (shippingMethodData) {
      shippingCost = Number(shippingMethodData.baseCost);
      const postDiscountSubtotal = subtotal - discount;
      if (shippingMethodData.freeThreshold && postDiscountSubtotal >= Number(shippingMethodData.freeThreshold)) {
        shippingCost = 0;
      }
    }

    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = Math.round(taxableAmount * taxRate);
    const total = Math.max(0, subtotal - discount + shippingCost + tax);

    let userId: string | undefined;
    const token = getAccessToken(request);
    if (token) {
      try { const payload = verifyToken(token); userId = payload.userId; } catch { /* expired — guest checkout */ }
    }

    const orderNumber = `${orderPrefix}-${Date.now().toString(36).toUpperCase().slice(-8)}`;

    let order;
    try {
      order = await db.$transaction(async (tx) => {
        const createdOrder = await tx.order.create({
          data: {
            orderNumber,
            userId,
            email,
            status: "processing" as const,
            subtotal,
            discount,
            shippingCost,
            tax,
            total,
            promoCode: promoCode?.toUpperCase() ?? null,
            shippingMethod,
            shippingAddress: normalizedAddress as Parameters<typeof tx.order.create>[0]["data"]["shippingAddress"],
            orderNotes: orderNotes ?? null,
            paymentMethod: (paymentMethod || "cod") as "cod",
            paymentStatus: "pending" as const,
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

        for (const item of items) {
          if (item.productId) {
            const product = productMap.get(item.slug);
            if (product && product.stockQuantity > 0) {
              const newStock = Math.max(0, product.stockQuantity - item.quantity);
              const shouldMarkOutOfStock = newStock === 0;
              await tx.product.update({
                where: { id: item.productId, stockQuantity: { gte: item.quantity } },
                data: {
                  stockQuantity: { decrement: item.quantity },
                  ...(shouldMarkOutOfStock && { inStock: false }),
                },
              });
            }
          }
        }

        if (promoId) {
          const updateWhere: Record<string, unknown> = { id: promoId };
          if (promoMaxUses) {
            updateWhere.usesCount = { lt: promoMaxUses };
          }
          const promoUpdate = await tx.promoCode.updateMany({
            where: updateWhere,
            data: { usesCount: { increment: 1 } },
          });
          if (promoUpdate.count === 0) {
            throw new Error("Promo code usage limit reached");
          }
        }

        // Increment FlashSale usage count and auto-deactivate if limit reached
        if (flashSaleId) {
          const flashWhere: Record<string, unknown> = { id: flashSaleId };
          if (flashSaleMaxUses) {
            flashWhere.usesCount = { lt: flashSaleMaxUses };
          }
          const flashUpdate = await tx.flashSale.updateMany({
            where: flashWhere,
            data: { usesCount: { increment: 1 } },
          });
          if (flashUpdate.count === 0) {
            throw new Error("Flash sale usage limit reached");
          }
          // Auto-deactivate if this was the last use
          if (flashSaleMaxUses) {
            const updatedFlash = await tx.flashSale.findUnique({ where: { id: flashSaleId }, select: { usesCount: true, maxUses: true } });
            if (updatedFlash && updatedFlash.maxUses && updatedFlash.usesCount >= updatedFlash.maxUses) {
              await tx.flashSale.update({ where: { id: flashSaleId }, data: { isActive: false } });
            }
          }
        }

        return createdOrder;
      });
    } catch (txError) {
      const errMsg = txError instanceof Error ? txError.message : "Transaction failed";
      if (errMsg.includes("Promo code usage limit") || errMsg.includes("Flash sale usage limit")) {
        return NextResponse.json(
          { error: "This promo code has reached its usage limit", code: "PROMO_EXHAUSTED" },
          { status: 409 }
        );
      }
      if (errMsg.includes("P2025") || errMsg.includes("stockQuantity")) {
        return NextResponse.json(
          { error: "Stock changed during checkout. Please review your cart.", code: "STOCK_CONFLICT" },
          { status: 409 }
        );
      }
      throw txError;
    }

    // Phase 3E: revalidate cached paths after order creation so the home/shop/sale
    // pages pick up the new stock levels. Per-path try/catch so a single failure
    // doesn't block the order response (the order is already saved at this point).
    try {
      const { revalidatePath } = await import("next/cache");
      const pathsToRevalidate = ["/", "/shop", "/sale"];
      for (const item of items) {
        pathsToRevalidate.push(`/product/${item.slug}`);
      }
      for (const path of pathsToRevalidate) {
        try {
          revalidatePath(path);
        } catch (pathError) {
          // Log but continue — order is already saved, single-path failure shouldn't break the response
          console.warn(`[orders] Failed to revalidate ${path}:`, pathError);
        }
      }
    } catch (importError) {
      // revalidatePath is always available in App Router route handlers — but if
      // the dynamic import fails for any reason, log and continue.
      console.warn("[orders] Failed to import revalidatePath:", importError);
    }

    if (userId) {
      void createNotification({
        userId,
        type: "order_status",
        title: "Order Placed",
        message: `Your order ${order.orderNumber} has been received and is being processed.`,
        link: "/account/orders",
      });
    }

    void notifyAdmins(
      "new_order",
      "New Order",
      `Order ${order.orderNumber} placed by ${email} — ${formatPrice(total)}`,
      `/admin/orders/${order.id}`
    );

    const customerName = shippingAddress.firstName ?? email;
    const { subject: emailSubject, html: emailHtml } = orderConfirmationEmail(
      order.orderNumber,
      formatPrice(total),
      items.map(i => ({ name: i.name, qty: i.quantity, price: formatPrice(i.price) })),
      customerName,
      {
        subtotal: formatPrice(subtotal),
        discount: discount > 0 ? `−${formatPrice(discount)}` : undefined,
        shipping: shippingCost === 0 ? "Free" : formatPrice(shippingCost),
        tax: formatPrice(tax),
      }
    );
    void sendEmail({ to: email, subject: emailSubject, html: emailHtml });

    return NextResponse.json({
      orderNumber: order.orderNumber,
      order: {
        id: order.id, orderNumber: order.orderNumber, date: order.createdAt.toISOString().split("T")[0],
        status: order.status, total: Number(order.total),
      },
      message: "Order placed successfully",
    });
  } catch (error) {
    console.error("[orders POST] failed:", error);
    return NextResponse.json({ error: "Order failed. Please try again.", code: "ORDER_ERROR" }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const Schema = z.object({
  eventType: z.enum(["add_to_cart", "remove_from_cart", "begin_checkout", "purchase"]),
  productSlug: z.string().optional(),
  productId: z.string().optional(),
  quantity: z.number().int().optional(),
});

/** POST /api/track/cart-event — logs a cart/checkout event */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

    const sessionId = request.headers.get("x-session-id") ?? null;

    await db.cartEvent.create({
      data: {
        eventType: parsed.data.eventType,
        productSlug: parsed.data.productSlug ?? null,
        productId: parsed.data.productId ?? null,
        quantity: parsed.data.quantity ?? null,
        sessionId,
      },
    }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

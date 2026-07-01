import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

const Schema = z.object({
  productSlug: z.string().min(1).max(120),
  productId: z.string().optional(),
});

/** POST /api/track/product-view — logs a product view */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

    const sessionId = request.headers.get("x-session-id") ?? null;

    await db.productView.create({
      data: {
        productSlug: parsed.data.productSlug,
        productId: parsed.data.productId ?? null,
        sessionId,
      },
    }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

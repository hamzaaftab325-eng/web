import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
export async function GET(_request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    const promo = await db.promoCode.findUnique({ where: { code: code.toUpperCase() } });
    if (!promo || !promo.isActive) return NextResponse.json({ error: "Invalid promo code", code: "INVALID_PROMO" }, { status: 404 });
    if (promo.expiresAt && promo.expiresAt < new Date()) return NextResponse.json({ error: "Promo code expired", code: "EXPIRED_PROMO" }, { status: 400 });
    if (promo.maxUses && promo.usesCount >= promo.maxUses) return NextResponse.json({ error: "Promo code usage limit reached", code: "MAX_USES" }, { status: 400 });
    return NextResponse.json({ code: promo.code, type: promo.type, value: Number(promo.value), label: promo.label, minOrder: Number(promo.minOrder) });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "FETCH_ERROR" }, { status: 500 }); }
}

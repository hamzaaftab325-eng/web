import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
export async function GET(_request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    const upperCode = code.toUpperCase();

    // First try the PromoCode table
    const promo = await db.promoCode.findUnique({ where: { code: upperCode } });
    if (promo && promo.isActive) {
      if (promo.expiresAt && promo.expiresAt < new Date()) return NextResponse.json({ error: "Promo code expired", code: "EXPIRED_PROMO" }, { status: 400 });
      if (promo.maxUses && promo.usesCount >= promo.maxUses) return NextResponse.json({ error: "Promo code usage limit reached", code: "MAX_USES" }, { status: 400 });
      return NextResponse.json({ code: promo.code, type: promo.type, value: Number(promo.value), label: promo.label, minOrder: Number(promo.minOrder) });
    }

    // Fallback: check FlashSale promo codes
    const flashSale = await db.flashSale.findFirst({
      where: {
        promoCode: upperCode,
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
    });
    if (flashSale && flashSale.discountPercent) {
      if (flashSale.maxUses && flashSale.usesCount >= flashSale.maxUses) {
        return NextResponse.json({ error: "This flash sale code has reached its customer limit", code: "MAX_USES" }, { status: 400 });
      }
      return NextResponse.json({
        code: flashSale.promoCode,
        type: "percent",
        value: Number(flashSale.discountPercent),
        label: flashSale.name,
        minOrder: 0,
        source: "flash_sale",
        remaining: flashSale.maxUses ? flashSale.maxUses - flashSale.usesCount : null,
      });
    }

    return NextResponse.json({ error: "Invalid promo code", code: "INVALID_PROMO" }, { status: 404 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "FETCH_ERROR" }, { status: 500 }); }
}
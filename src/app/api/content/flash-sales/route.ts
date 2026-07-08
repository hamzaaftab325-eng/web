import { NextResponse } from "next/server";

import { db } from "@/lib/db";

/** GET /api/content/flash-sales — returns currently active flash sale */
export async function GET() {
  try {
    const now = new Date();
    const sale = await db.flashSale.findFirst({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { endDate: "asc" },
    });
    if (!sale) return NextResponse.json(null);
    return NextResponse.json({
      id: sale.id,
      name: sale.name,
      description: sale.description,
      discountPercent: sale.discountPercent ? Number(sale.discountPercent) : null,
      promoCode: sale.promoCode,
      maxUses: sale.maxUses,
      usesCount: sale.usesCount,
      endDate: sale.endDate.toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed", code: "FETCH_ERROR" },
      { status: 500 }
    );
  }
}
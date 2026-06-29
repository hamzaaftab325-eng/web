import { NextResponse } from "next/server";
import { db } from "@/lib/db";
export async function GET() {
  try {
    const offer = await db.firstOrderOffer.findFirst();
    return NextResponse.json(offer ?? { isActive: false, discountPercent: 10, promoCode: "AURA10", popupTitle: "First order? 10% off", popupDescription: "Sign up to reveal your code.", bannerText: "", dismissDurationDays: 30, showDelayMs: 3000 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "FETCH_ERROR" }, { status: 500 }); }
}

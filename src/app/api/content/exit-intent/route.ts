import { NextResponse } from "next/server";
import { db } from "@/lib/db";
export async function GET() {
  try {
    const popup = await db.exitIntentPopup.findFirst();
    return NextResponse.json(popup ?? { isActive: false, title: "Wait! 10% off your first order", description: "Enter your email for a one-time discount code.", discountPercent: 10, promoCode: "AURA10", imageUrl: "", triggerDelaySeconds: 30 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "FETCH_ERROR" }, { status: 500 }); }
}

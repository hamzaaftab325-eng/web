import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";

const OfferSchema = z.object({
  isActive: z.boolean().optional(),
  discountPercent: z.number().min(0).max(100).optional(),
  promoCode: z.string().min(1).max(50).optional(),
  popupTitle: z.string().min(1).max(200).optional(),
  popupDescription: z.string().max(500).nullable().optional(),
  bannerText: z.string().max(300).nullable().optional(),
  dismissDurationDays: z.number().int().min(1).max(365).optional(),
  showDelayMs: z.number().int().min(0).max(60000).optional(),
});

/** GET /api/admin/content/first-order-offer */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  const offer = await db.firstOrderOffer.findFirst();
  return NextResponse.json({ offer: offer ? { ...offer, discountPercent: Number(offer.discountPercent) } : null });
}

/** PUT /api/admin/content/first-order-offer */
export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  const body = await request.json();
  const parsed = OfferSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation failed", code: "VALIDATION_ERROR" }, { status: 400 });
  const data = parsed.data;
  const existing = await db.firstOrderOffer.findFirst();
  if (existing) {
    const offer = await db.firstOrderOffer.update({ where: { id: existing.id }, data: { ...data, discountPercent: data.discountPercent ?? undefined } });
    return NextResponse.json({ offer: { ...offer, discountPercent: Number(offer.discountPercent) }, message: "Offer updated" });
  }
  const offer = await db.firstOrderOffer.create({ data: { isActive: data.isActive ?? true, discountPercent: data.discountPercent ?? 10, promoCode: data.promoCode ?? "WELCOME10", popupTitle: data.popupTitle ?? "First order? 10% off", popupDescription: data.popupDescription, bannerText: data.bannerText, dismissDurationDays: data.dismissDurationDays ?? 30, showDelayMs: data.showDelayMs ?? 3000 } });
  return NextResponse.json({ offer: { ...offer, discountPercent: Number(offer.discountPercent) }, message: "Offer created" }, { status: 201 });
}

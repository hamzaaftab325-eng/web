import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";

const PopupSchema = z.object({
  isActive: z.boolean().optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(500).nullable().optional(),
  discountPercent: z.number().min(0).max(100).nullable().optional(),
  promoCode: z.string().max(50).nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  triggerDelaySeconds: z.number().int().min(0).max(300).optional(),
});

/** GET /api/admin/content/exit-intent */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  const popup = await db.exitIntentPopup.findFirst();
  return NextResponse.json({ popup: popup ? { ...popup, discountPercent: popup.discountPercent ? Number(popup.discountPercent) : null } : null });
}

/** PUT /api/admin/content/exit-intent */
export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  const body = await request.json();
  const parsed = PopupSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation failed", code: "VALIDATION_ERROR" }, { status: 400 });
  const data = parsed.data;
  const existing = await db.exitIntentPopup.findFirst();
  if (existing) {
    const popup = await db.exitIntentPopup.update({ where: { id: existing.id }, data: { ...data, discountPercent: data.discountPercent ?? undefined } });
    return NextResponse.json({ popup: { ...popup, discountPercent: popup.discountPercent ? Number(popup.discountPercent) : null }, message: "Popup updated" });
  }
  const popup = await db.exitIntentPopup.create({ data: { isActive: data.isActive ?? true, title: data.title ?? "Wait! 10% off", description: data.description, discountPercent: data.discountPercent ?? 10, promoCode: data.promoCode, imageUrl: data.imageUrl, triggerDelaySeconds: data.triggerDelaySeconds ?? 30 } });
  return NextResponse.json({ popup: { ...popup, discountPercent: popup.discountPercent ? Number(popup.discountPercent) : null }, message: "Popup created" }, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";

import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";

const PromoCodeUpdateSchema = z.object({
  type: z.enum(["percent", "fixed", "shipping"]).optional(),
  value: z.number().nonnegative().optional(),
  label: z.string().min(1).max(100).optional(),
  minOrder: z.number().nonnegative().optional(),
  maxUses: z.number().int().positive().nullable().optional(),
  startsAt: z.string().datetime().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  isActive: z.boolean().optional(),
});

/** PUT /api/admin/promo-codes/[id] — update a promo code (admin only). */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;
    const { id } = await params;
    const body = await request.json();
    const parsed = PromoCodeUpdateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation failed", code: "VALIDATION_ERROR" }, { status: 400 });
    const data = parsed.data;
    const promo = await db.promoCode.update({
      where: { id },
      data: {
        ...(data.type !== undefined && { type: data.type }),
        ...(data.value !== undefined && { value: data.value }),
        ...(data.label !== undefined && { label: data.label }),
        ...(data.minOrder !== undefined && { minOrder: data.minOrder }),
        ...(data.maxUses !== undefined && { maxUses: data.maxUses }),
        ...(data.startsAt !== undefined && { startsAt: data.startsAt ? new Date(data.startsAt) : null }),
        ...(data.expiresAt !== undefined && { expiresAt: data.expiresAt ? new Date(data.expiresAt) : null }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });
    return NextResponse.json({ promoCode: promo, message: "Promo code updated" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "UPDATE_ERROR" }, { status: 500 });
  }
}

/** DELETE /api/admin/promo-codes/[id] — delete a promo code (admin only). */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;
    const { id } = await params;
    await db.promoCode.delete({ where: { id } });
    return NextResponse.json({ message: "Promo code deleted" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "DELETE_ERROR" }, { status: 500 });
  }
}

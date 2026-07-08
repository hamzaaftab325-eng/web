import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";

import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";

const PromoCodeSchema = z.object({
  code: z.string().min(2).max(50).regex(/^[A-Z0-9-_]+$/, "Code must be uppercase letters, numbers, dashes"),
  type: z.enum(["percent", "fixed", "shipping"]),
  value: z.number().nonnegative(),
  label: z.string().min(1).max(100),
  minOrder: z.number().nonnegative().optional(),
  maxUses: z.number().int().positive().optional(),
  startsAt: z.string().datetime().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  isActive: z.boolean().optional(),
});

/** GET /api/admin/promo-codes — list all promo codes (admin only). */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;
    const codes = await db.promoCode.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({
      promoCodes: codes.map(c => ({
        ...c, value: Number(c.value), minOrder: Number(c.minOrder),
        startsAt: c.startsAt?.toISOString().split("T")[0] ?? null,
        expiresAt: c.expiresAt?.toISOString().split("T")[0] ?? null,
        createdAt: c.createdAt.toISOString().split("T")[0],
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "FETCH_ERROR" }, { status: 500 });
  }
}

/** POST /api/admin/promo-codes — create a new promo code (admin only). */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;
    const body = await request.json();
    const parsed = PromoCodeSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation failed", code: "VALIDATION_ERROR" }, { status: 400 });
    const data = parsed.data;
    const existing = await db.promoCode.findUnique({ where: { code: data.code } });
    if (existing) return NextResponse.json({ error: "Code already exists", code: "CONFLICT" }, { status: 409 });
    const promo = await db.promoCode.create({
      data: {
        code: data.code, type: data.type, value: data.value, label: data.label,
        minOrder: data.minOrder ?? 0, maxUses: data.maxUses,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        isActive: data.isActive ?? true,
      },
    });
    return NextResponse.json({ promoCode: promo, message: "Promo code created" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "CREATE_ERROR" }, { status: 500 });
  }
}

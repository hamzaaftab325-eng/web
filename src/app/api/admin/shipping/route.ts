import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";

import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";

const ShippingMethodSchema = z.object({
  code: z.string().min(2).max(50),
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  baseCost: z.number().nonnegative(),
  freeThreshold: z.number().nonnegative().nullable().optional(),
  estimatedDays: z.string().max(50).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

/**
 * GET /api/admin/shipping — list all shipping methods (admin only).
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;

    const methods = await db.shippingMethod.findMany({ orderBy: { sortOrder: "asc" } });
    return NextResponse.json({
      shippingMethods: methods.map(m => ({
        ...m, baseCost: Number(m.baseCost),
        freeThreshold: m.freeThreshold ? Number(m.freeThreshold) : null,
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "FETCH_ERROR" }, { status: 500 });
  }
}

/**
 * POST /api/admin/shipping — create a shipping method (admin only).
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const parsed = ShippingMethodSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation failed", code: "VALIDATION_ERROR" }, { status: 400 });
    }
    const data = parsed.data;

    const method = await db.shippingMethod.create({
      data: {
        code: data.code, name: data.name, description: data.description,
        baseCost: data.baseCost, freeThreshold: data.freeThreshold,
        estimatedDays: data.estimatedDays, isActive: data.isActive ?? true,
        sortOrder: data.sortOrder ?? 0,
      },
    });
    return NextResponse.json({ shippingMethod: method, message: "Shipping method created" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "CREATE_ERROR" }, { status: 500 });
  }
}

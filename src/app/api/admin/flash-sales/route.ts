import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";

import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";

const Schema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long (max 100)"),
  description: z.string().max(500, "Description too long (max 500)").optional(),
  startDate: z.string().datetime("Invalid start date format"),
  endDate: z.string().datetime("Invalid end date format"),
  discountPercent: z.number().min(0).max(100).optional(),
  promoCode: z
    .string()
    .max(50, "Promo code too long (max 50)")
    .regex(/^[A-Z0-9_-]+$/i, "Promo code must be alphanumeric (A-Z, 0-9, -, _)")
    .optional(),
  maxUses: z.number().int().min(1, "Max uses must be at least 1").optional().nullable(),
  isActive: z.boolean().optional(),
}).refine(
  (d) => !d.startDate || !d.endDate || new Date(d.startDate) < new Date(d.endDate),
  { message: "End date must be after start date", path: ["endDate"] }
);

// Phase 6A: Replaced Record<string, unknown> with the actual Prisma FlashSale type.
// The serialize function now properly types Decimal→number and Date→ISO string.
function serialize(sale: {
  id: string;
  name: string;
  slug?: string;
  description: string | null;
  isActive: boolean;
  discountPercent: { toNumber: () => number } | number | null;
  startDate: Date;
  endDate: Date;
  maxUses: number | null;
  usesCount: number;
  createdAt: Date;
  updatedAt: Date;
}) {
  const toNum = (v: { toNumber: () => number } | number | null): number | null => {
    if (v == null) return null;
    return typeof v === "number" ? v : v.toNumber();
  };
  return {
    id: sale.id,
    name: sale.name,
    slug: sale.slug ?? "",
    description: sale.description,
    isActive: sale.isActive,
    discountPercent: toNum(sale.discountPercent),
    startDate: sale.startDate.toISOString(),
    endDate: sale.endDate.toISOString(),
    maxUses: sale.maxUses,
    usesCount: sale.usesCount,
    createdAt: sale.createdAt.toISOString(),
    updatedAt: sale.updatedAt.toISOString(),
  };
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const sales = await db.flashSale.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ flashSales: sales.map(serialize) });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Validation failed";
    return NextResponse.json(
      { error: msg, code: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const sale = await db.flashSale.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      discountPercent: data.discountPercent,
      promoCode: data.promoCode ? data.promoCode.toUpperCase() : null,
      maxUses: data.maxUses ?? null,
      isActive: data.isActive ?? true,
    },
  });

  return NextResponse.json(
    { flashSale: serialize(sale), message: "Flash sale created" },
    { status: 201 }
  );
}
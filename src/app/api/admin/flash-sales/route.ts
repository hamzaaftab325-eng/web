import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";

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

function serialize(sale: Record<string, unknown>) {
  return {
    ...sale,
    discountPercent: sale.discountPercent ? Number(sale.discountPercent) : null,
    startDate: (sale.startDate as Date).toISOString(),
    endDate: (sale.endDate as Date).toISOString(),
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
    { flashSale: serialize(sale as unknown as Record<string, unknown>), message: "Flash sale created" },
    { status: 201 }
  );
}
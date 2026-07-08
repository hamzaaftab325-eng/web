import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";

import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";

const Schema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  discountPercent: z.number().min(0).max(100).nullable().optional(),
  promoCode: z
    .string()
    .max(50)
    .regex(/^[A-Z0-9_-]+$/i)
    .nullable()
    .optional(),
  maxUses: z.number().int().min(1).nullable().optional(),
  isActive: z.boolean().optional(),
  resetUsesCount: z.boolean().optional(),
});

// Phase 6A: Same typed serialize as flash-sales/route.ts — replaced Record<string, unknown>.
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

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;

  const existing = await db.flashSale.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Flash sale not found", code: "NOT_FOUND" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? "Validation failed";
    return NextResponse.json({ error: msg, code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const data = parsed.data;

  // Cross-validate dates against DB values
  const newStart = data.startDate ? new Date(data.startDate) : existing.startDate;
  const newEnd = data.endDate ? new Date(data.endDate) : existing.endDate;
  if (newStart >= newEnd) {
    return NextResponse.json(
      { error: "End date must be after start date", code: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  // Prevent re-activation when usage limit is reached (unless resetUsesCount)
  if (data.isActive === true && !data.resetUsesCount && existing.maxUses && existing.usesCount >= existing.maxUses) {
    return NextResponse.json(
      { error: "Cannot activate: usage limit reached. Use reset to re-enable.", code: "LIMIT_REACHED" },
      { status: 409 }
    );
  }

  const sale = await db.flashSale.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.startDate !== undefined && { startDate: new Date(data.startDate) }),
      ...(data.endDate !== undefined && { endDate: new Date(data.endDate) }),
      ...(data.discountPercent !== undefined && { discountPercent: data.discountPercent }),
      ...(data.promoCode !== undefined && { promoCode: data.promoCode ? data.promoCode.toUpperCase() : null }),
      ...(data.maxUses !== undefined && { maxUses: data.maxUses }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.resetUsesCount && { usesCount: 0, isActive: true }),
    },
  });

  return NextResponse.json({ flashSale: serialize(sale), message: "Flash sale updated" });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  const { id } = await params;

  const existing = await db.flashSale.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Flash sale not found", code: "NOT_FOUND" }, { status: 404 });
  }

  await db.flashSale.delete({ where: { id } });
  return NextResponse.json({ message: "Flash sale deleted" });
}
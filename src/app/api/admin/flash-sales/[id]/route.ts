import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";

const UpdateSchema = z.object({
  name: z.string().min(1, "Sale name is required").max(120, "Name too long").optional(),
  description: z.string().max(600, "Description too long").nullable().optional(),
  startDate: z.string().datetime("Invalid start date format").optional(),
  endDate: z.string().datetime("Invalid end date format").optional(),
  discountPercent: z.number().min(0, "Discount cannot be negative").max(100, "Max 100%").nullable().optional(),
  promoCode: z.string().max(50, "Promo code too long").regex(/^[A-Za-z0-9_-]*$/, "Only letters, numbers, hyphens, underscores").nullable().optional().or(z.literal("")),
  isActive: z.boolean().optional(),
});

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = UpdateSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Validation failed";
      return NextResponse.json({ error: message, code: "VALIDATION_ERROR" }, { status: 400 });
    }

    const data = parsed.data;

    // If both dates are provided, validate end > start
    if (data.startDate && data.endDate) {
      if (new Date(data.endDate) <= new Date(data.startDate)) {
        return NextResponse.json({ error: "End date must be after start date", code: "VALIDATION_ERROR" }, { status: 400 });
      }
    }

    // If only one date is provided, validate against the existing other date
    if (data.startDate || data.endDate) {
      const existing = await db.flashSale.findUnique({ where: { id }, select: { startDate: true, endDate: true } });
      if (!existing) {
        return NextResponse.json({ error: "Flash sale not found", code: "NOT_FOUND" }, { status: 404 });
      }
      const start = data.startDate ? new Date(data.startDate) : existing.startDate;
      const end = data.endDate ? new Date(data.endDate) : existing.endDate;
      if (end <= start) {
        return NextResponse.json({ error: "End date must be after start date", code: "VALIDATION_ERROR" }, { status: 400 });
      }
    }

    // Clean empty promoCode to null
    const promoCode = data.promoCode !== undefined
      ? (data.promoCode?.trim() || null)
      : undefined;

    const sale = await db.flashSale.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name.trim() }),
        ...(data.description !== undefined && { description: data.description?.trim() || null }),
        ...(data.startDate !== undefined && { startDate: new Date(data.startDate) }),
        ...(data.endDate !== undefined && { endDate: new Date(data.endDate) }),
        ...(data.discountPercent !== undefined && { discountPercent: data.discountPercent }),
        ...(promoCode !== undefined && { promoCode }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    return NextResponse.json({ flashSale: sale, message: "Flash sale updated successfully" });
  } catch (error) {
    console.error(`[PUT /api/admin/flash-sales/${params}]`, error);
    return NextResponse.json({ error: "Failed to update flash sale", code: "UPDATE_ERROR" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { id } = await params;

    // Verify it exists before deleting
    const existing = await db.flashSale.findUnique({ where: { id }, select: { id: true } });
    if (!existing) {
      return NextResponse.json({ error: "Flash sale not found", code: "NOT_FOUND" }, { status: 404 });
    }

    await db.flashSale.delete({ where: { id } });
    return NextResponse.json({ message: "Flash sale deleted successfully" });
  } catch (error) {
    console.error(`[DELETE /api/admin/flash-sales/${params}]`, error);
    return NextResponse.json({ error: "Failed to delete flash sale", code: "DELETE_ERROR" }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";

const CreateSchema = z.object({
  name: z.string().min(1, "Sale name is required").max(120, "Name too long (max 120 characters)"),
  description: z.string().max(600, "Description too long (max 600 characters)").optional(),
  startDate: z.string().datetime("Invalid start date format"),
  endDate: z.string().datetime("Invalid end date format"),
  discountPercent: z.number().min(0, "Discount cannot be negative").max(100, "Discount cannot exceed 100%").optional(),
  promoCode: z.string().max(50, "Promo code too long").regex(/^[A-Za-z0-9_-]*$/, "Only letters, numbers, hyphens, and underscores").optional().or(z.literal("")),
  isActive: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const sales = await db.flashSale.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({
      flashSales: sales.map((s) => ({
        ...s,
        discountPercent: s.discountPercent ? Number(s.discountPercent) : null,
        startDate: s.startDate.toISOString(),
        endDate: s.endDate.toISOString(),
      })),
    });
  } catch (error) {
    console.error("[GET /api/admin/flash-sales]", error);
    return NextResponse.json({ error: "Failed to fetch flash sales", code: "FETCH_ERROR" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const parsed = CreateSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Validation failed";
      return NextResponse.json({ error: message, code: "VALIDATION_ERROR" }, { status: 400 });
    }

    const data = parsed.data;

    // Business rule: end date must be after start date
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (end <= start) {
      return NextResponse.json({ error: "End date must be after start date", code: "VALIDATION_ERROR" }, { status: 400 });
    }

    // Clean empty promoCode to null
    const promoCode = data.promoCode?.trim() || null;

    const sale = await db.flashSale.create({
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        startDate: start,
        endDate: end,
        discountPercent: data.discountPercent ?? null,
        promoCode,
        isActive: data.isActive ?? true, // Default ACTIVE when created from admin
      },
    });

    return NextResponse.json({ flashSale: sale, message: "Flash sale created successfully" }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/flash-sales]", error);
    return NextResponse.json({ error: "Failed to create flash sale", code: "CREATE_ERROR" }, { status: 500 });
  }
}
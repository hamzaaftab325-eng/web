import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";

const Schema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  discountPercent: z.number().min(0).max(100).optional(),
  promoCode: z.string().max(50).optional(),
  isActive: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  const sales = await db.flashSale.findMany({ orderBy: { startDate: "desc" } });
  return NextResponse.json({ flashSales: sales.map(s => ({ ...s, discountPercent: s.discountPercent ? Number(s.discountPercent) : null, startDate: s.startDate.toISOString(), endDate: s.endDate.toISOString() })) });
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  const body = await request.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation failed", code: "VALIDATION_ERROR" }, { status: 400 });
  const data = parsed.data;
  const sale = await db.flashSale.create({ data: { name: data.name, description: data.description, startDate: new Date(data.startDate), endDate: new Date(data.endDate), discountPercent: data.discountPercent, promoCode: data.promoCode, isActive: data.isActive ?? true } });
  return NextResponse.json({ flashSale: sale, message: "Flash sale created" }, { status: 201 });
}

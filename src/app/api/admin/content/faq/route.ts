import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";

import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";

const FaqSchema = z.object({
  question: z.string().min(2).max(300),
  answer: z.string().min(1).max(2000),
  category: z.string().min(1).max(50),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

/** GET /api/admin/content/faq */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;
    const items = await db.faqItem.findMany({ orderBy: { sortOrder: "asc" } });
    return NextResponse.json({ faqItems: items });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "FETCH_ERROR" }, { status: 500 });
  }
}

/** POST /api/admin/content/faq */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;
    const body = await request.json();
    const parsed = FaqSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation failed", code: "VALIDATION_ERROR" }, { status: 400 });
    const data = parsed.data;
    const item = await db.faqItem.create({ data: { ...data, sortOrder: data.sortOrder ?? 0, isActive: data.isActive ?? true } });
    revalidatePath("/");
    return NextResponse.json({ faqItem: item, message: "FAQ created" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "CREATE_ERROR" }, { status: 500 });
  }
}

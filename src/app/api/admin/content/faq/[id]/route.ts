import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";

const FaqUpdateSchema = z.object({
  question: z.string().min(2).max(300).optional(),
  answer: z.string().min(1).max(2000).optional(),
  category: z.string().min(1).max(50).optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

/** PUT /api/admin/content/faq/[id] */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;
    const { id } = await params;
    const body = await request.json();
    const parsed = FaqUpdateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation failed", code: "VALIDATION_ERROR" }, { status: 400 });
    const item = await db.faqItem.update({ where: { id }, data: parsed.data });
    return NextResponse.json({ faqItem: item, message: "FAQ updated" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "UPDATE_ERROR" }, { status: 500 });
  }
}

/** DELETE /api/admin/content/faq/[id] */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;
    const { id } = await params;
    await db.faqItem.delete({ where: { id } });
    return NextResponse.json({ message: "FAQ deleted" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "DELETE_ERROR" }, { status: 500 });
  }
}

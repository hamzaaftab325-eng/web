import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { sanitizeHtml } from "@/lib/security";

const AnswerSchema = z.object({
  answer: z.string().min(1).max(2000),
});

/** PUT /api/admin/questions/[id] — answer a question */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    const body = await request.json();
    const parsed = AnswerSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation failed", code: "VALIDATION_ERROR" }, { status: 400 });

    const question = await db.question.update({
      where: { id },
      data: { answer: sanitizeHtml(parsed.data.answer), isAnswered: true, answeredAt: new Date() },
    });

    return NextResponse.json({ question, message: "Question answered" });
  } catch {
    return NextResponse.json({ error: "Failed", code: "UPDATE_ERROR" }, { status: 500 });
  }
}

/** DELETE /api/admin/questions/[id] — delete a question */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    await db.question.delete({ where: { id } });
    return NextResponse.json({ message: "Question deleted" });
  } catch {
    return NextResponse.json({ error: "Failed", code: "DELETE_ERROR" }, { status: 500 });
  }
}

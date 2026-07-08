import { NextRequest, NextResponse } from "next/server";

import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/lib/db";

/** GET /api/admin/questions — list all questions for admin moderation */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") ?? "all";

    const where = filter === "unanswered" ? { isAnswered: false } : filter === "answered" ? { isAnswered: true } : {};
    const questions = await db.question.findMany({
      where, orderBy: { createdAt: "desc" }, take: 100,
      include: { product: { select: { name: true, slug: true } } },
    });

    return NextResponse.json({
      questions: questions.map(q => ({
        id: q.id, authorName: q.authorName, authorEmail: q.authorEmail,
        question: q.question, answer: q.answer, isAnswered: q.isAnswered,
        productSlug: q.productSlug, productName: q.product?.name ?? "Unknown",
        createdAt: q.createdAt.toISOString().split("T")[0],
        answeredAt: q.answeredAt?.toISOString().split("T")[0] ?? null,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Failed", code: "FETCH_ERROR" }, { status: 500 });
  }
}

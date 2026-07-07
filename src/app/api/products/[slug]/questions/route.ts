import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { getAccessToken } from "@/lib/auth-cookies";
import { sanitizeHtml } from "@/lib/security";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

/** GET /api/products/[slug]/questions — list answered questions for a product */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const questions = await db.question.findMany({
      where: { productSlug: slug, isAnswered: true, isActive: true },
      orderBy: { answeredAt: "desc" },
      select: { id: true, authorName: true, question: true, answer: true, answeredAt: true },
    });
    return NextResponse.json(questions.map(q => ({
      id: q.id, authorName: q.authorName, question: q.question,
      answer: q.answer, date: q.answeredAt?.toISOString().split("T")[0] ?? "",
    })));
  } catch {
    return NextResponse.json({ error: "Failed", code: "FETCH_ERROR" }, { status: 500 });
  }
}

const QuestionSchema = z.object({
  authorName: z.string().min(1).max(100),
  authorEmail: z.string().email().optional(),
  question: z.string().min(3).max(500),
});

/** POST /api/products/[slug]/questions — submit a question */
export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const blocked = await rateLimit(request, 5, "1 h", `question:${getClientIp(request)}`);
    if (blocked) return blocked;

    const { slug } = await params;
    const product = await db.product.findUnique({ where: { slug } });
    if (!product) return NextResponse.json({ error: "Product not found", code: "NOT_FOUND" }, { status: 404 });

    const body = await request.json();
    const parsed = QuestionSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation failed", code: "VALIDATION_ERROR" }, { status: 400 });

    // Get userId if authenticated
    let userId: string | undefined;
    const token = getAccessToken(request);
    if (token) { try { const p = verifyToken(token); userId = p.userId; } catch { /* Intentionally empty — best-effort auth */ } }

    const question = await db.question.create({
      data: {
        productId: product.id, productSlug: slug,
        userId, authorName: sanitizeHtml(parsed.data.authorName),
        authorEmail: parsed.data.authorEmail, question: sanitizeHtml(parsed.data.question),
      },
    });

    return NextResponse.json({ question, message: "Question submitted — we'll answer soon" }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed", code: "QUESTION_ERROR" }, { status: 500 });
  }
}

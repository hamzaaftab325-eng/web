import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";

const JournalSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(2).max(120).regex(/^[a-z0-9-]+$/),
  category: z.string().min(1).max(50),
  excerpt: z.string().min(1).max(500),
  body: z.string().min(1),
  heroImage: z.string().url(),
  author: z.string().min(1).max(100),
  readTime: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
  publishedAt: z.string().datetime().optional(),
});

/** GET /api/admin/content/journal */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;
    const articles = await db.journalArticle.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({
      articles: articles.map(a => ({
        ...a,
        body: typeof a.body === "string" ? a.body : JSON.stringify(a.body),
        publishedAt: a.publishedAt?.toISOString().split("T")[0] ?? null,
        createdAt: a.createdAt.toISOString().split("T")[0],
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "FETCH_ERROR" }, { status: 500 });
  }
}

/** POST /api/admin/content/journal */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;
    const body = await request.json();
    const parsed = JournalSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation failed", code: "VALIDATION_ERROR" }, { status: 400 });
    const data = parsed.data;
    const existing = await db.journalArticle.findUnique({ where: { slug: data.slug } });
    if (existing) return NextResponse.json({ error: "Slug already in use", code: "CONFLICT" }, { status: 409 });
    const article = await db.journalArticle.create({
      data: {
        title: data.title, slug: data.slug, category: data.category,
        excerpt: data.excerpt, body: data.body as never,
        heroImage: data.heroImage, author: data.author,
        readTime: data.readTime, isActive: data.isActive ?? true,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date(),
      },
    });
    revalidatePath("/");
    revalidatePath("/journal")
    revalidatePath("/journal/[slug]");
    return NextResponse.json({ article, message: "Article created" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "CREATE_ERROR" }, { status: 500 });
  }
}

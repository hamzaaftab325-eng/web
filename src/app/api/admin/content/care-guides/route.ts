import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";

const CareGuideSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(2).max(120).regex(/^[a-z0-9-]+$/),
  material: z.string().min(1).max(100),
  excerpt: z.string().min(1).max(500),
  body: z.string().min(1),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

/** GET /api/admin/content/care-guides */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;
    const guides = await db.careGuide.findMany({ orderBy: { sortOrder: "asc" } });
    return NextResponse.json({
      careGuides: guides.map(g => ({
        ...g,
        body: typeof g.body === "string" ? g.body : JSON.stringify(g.body),
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "FETCH_ERROR" }, { status: 500 });
  }
}

/** POST /api/admin/content/care-guides */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;
    const body = await request.json();
    const parsed = CareGuideSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation failed", code: "VALIDATION_ERROR" }, { status: 400 });
    const data = parsed.data;
    const existing = await db.careGuide.findUnique({ where: { slug: data.slug } });
    if (existing) return NextResponse.json({ error: "Slug already in use", code: "CONFLICT" }, { status: 409 });
    const guide = await db.careGuide.create({
      data: {
        title: data.title, slug: data.slug, material: data.material,
        excerpt: data.excerpt, body: data.body as never,
        sortOrder: data.sortOrder ?? 0, isActive: data.isActive ?? true,
      },
    });
    return NextResponse.json({ careGuide: guide, message: "Care guide created" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "CREATE_ERROR" }, { status: 500 });
  }
}

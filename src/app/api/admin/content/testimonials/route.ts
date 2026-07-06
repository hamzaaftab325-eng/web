import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";

const TestimonialSchema = z.object({
  authorName: z.string().min(1).max(100),
  authorLocation: z.string().max(100).optional(),
  quote: z.string().min(1).max(500),
  rating: z.number().int().min(1).max(5).optional(),
  productSlug: z.string().max(120).optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

/** GET /api/admin/content/testimonials */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;
    const items = await db.testimonial.findMany({ orderBy: { sortOrder: "asc" } });
    return NextResponse.json({ testimonials: items });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "FETCH_ERROR" }, { status: 500 });
  }
}

/** POST /api/admin/content/testimonials */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;
    const body = await request.json();
    const parsed = TestimonialSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation failed", code: "VALIDATION_ERROR" }, { status: 400 });
    const data = parsed.data;
    const item = await db.testimonial.create({
      data: {
        authorName: data.authorName, authorLocation: data.authorLocation,
        quote: data.quote, rating: data.rating ?? 5,
        productSlug: data.productSlug,
        sortOrder: data.sortOrder ?? 0, isActive: data.isActive ?? true,
      },
    });
    revalidatePath("/");
    return NextResponse.json({ testimonial: item, message: "Testimonial created" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "CREATE_ERROR" }, { status: 500 });
  }
}

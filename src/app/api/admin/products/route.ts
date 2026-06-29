import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";

const ProductCreateSchema = z.object({
  slug: z.string().min(2).max(120).regex(/^[a-z0-9-]+$/, "slug must be lowercase kebab-case"),
  name: z.string().min(2).max(200),
  subtitle: z.string().max(200).optional(),
  description: z.string().min(1).max(2000),
  longDescription: z.string().max(8000).optional(),
  price: z.number().nonnegative(),
  compareAtPrice: z.number().nonnegative().optional(),
  categorySlug: z.string().optional(),
  badge: z.string().max(60).optional(),
  inStock: z.boolean().optional(),
  stockQuantity: z.number().int().nonnegative().optional(),
  materials: z.array(z.string()).optional(),
  dimensions: z.string().max(200).optional(),
  careInstructions: z.string().max(2000).optional(),
  featured: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
  images: z.array(z.object({ url: z.string().url(), altText: z.string().optional() })).optional(),
});

/**
 * POST /api/admin/products
 * Create a new product (admin only).
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;

    const body = await request.json();
    const parsed = ProductCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation failed", code: "VALIDATION_ERROR" }, { status: 400 });
    }
    const data = parsed.data;

    // Resolve category
    let categoryId: string | undefined;
    if (data.categorySlug) {
      const cat = await db.category.findUnique({ where: { slug: data.categorySlug } });
      if (!cat) return NextResponse.json({ error: "Category not found", code: "NOT_FOUND" }, { status: 400 });
      categoryId = cat.id;
    }

    // Slug uniqueness check
    const existing = await db.product.findUnique({ where: { slug: data.slug } });
    if (existing) return NextResponse.json({ error: "Slug already in use", code: "CONFLICT" }, { status: 409 });

    const product = await db.product.create({
      data: {
        slug: data.slug,
        name: data.name,
        subtitle: data.subtitle,
        description: data.description,
        longDescription: data.longDescription,
        price: data.price,
        compareAtPrice: data.compareAtPrice,
        categoryId,
        badge: data.badge,
        inStock: data.inStock ?? true,
        stockQuantity: data.stockQuantity ?? 0,
        materials: data.materials ?? [],
        dimensions: data.dimensions,
        careInstructions: data.careInstructions,
        featured: data.featured ?? false,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
        images: data.images?.length
          ? { create: data.images.map((img, i) => ({ url: img.url, altText: img.altText, sortOrder: i })) }
          : undefined,
      },
      include: { images: true, category: true },
    });

    return NextResponse.json({ product, message: "Product created" }, { status: 201 });
  } catch (error) {
    console.error("[admin/products POST] failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create product", code: "CREATE_ERROR" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/products
 * List all products (admin only) — includes inactive.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(200, Math.max(1, parseInt(searchParams.get("limit") ?? "100", 10)));

    const [products, total] = await Promise.all([
      db.product.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { category: true, images: { orderBy: { sortOrder: "asc" } } },
      }),
      db.product.count(),
    ]);

    return NextResponse.json({
      products: products.map(p => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        price: Number(p.price),
        stockQuantity: p.stockQuantity,
        inStock: p.inStock,
        isActive: p.isActive,
        featured: p.featured,
        category: p.category ? { name: p.category.name, slug: p.category.slug } : null,
        images: p.images.map(i => i.url),
      })),
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("[admin/products GET] failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed", code: "FETCH_ERROR" },
      { status: 500 }
    );
  }
}

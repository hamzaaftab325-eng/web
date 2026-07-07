import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
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
  variants: z.array(z.object({
    label: z.string().min(1).max(100),
    swatchColor: z.string().max(20).optional(),
    stockQuantity: z.number().int().nonnegative().optional(),
    sortOrder: z.number().int().optional(),
  })).optional(),
  collectionIds: z.array(z.string()).optional(),
});

/**
 * POST /api/admin/products — create a new product (admin only).
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

    let categoryId: string | undefined;
    if (data.categorySlug) {
      const cat = await db.category.findUnique({ where: { slug: data.categorySlug } });
      if (!cat) return NextResponse.json({ error: "Category not found", code: "NOT_FOUND" }, { status: 400 });
      categoryId = cat.id;
    }

    const existing = await db.product.findUnique({ where: { slug: data.slug } });
    if (existing) return NextResponse.json({ error: "Slug already in use", code: "CONFLICT" }, { status: 409 });

    // Wrap create in a transaction so nested writes (images, variants, collections)
    // are atomic. If any nested insert fails, the entire product creation rolls
    // back — no orphan product row left behind.
    const product = await db.$transaction(async (tx) => {
      return tx.product.create({
        data: {
          slug: data.slug, name: data.name, subtitle: data.subtitle,
          description: data.description, longDescription: data.longDescription,
          price: data.price, compareAtPrice: data.compareAtPrice, categoryId,
          badge: data.badge, inStock: data.inStock ?? true,
          stockQuantity: data.stockQuantity ?? 0, materials: data.materials ?? [],
          dimensions: data.dimensions, careInstructions: data.careInstructions,
          featured: data.featured ?? false, sortOrder: data.sortOrder ?? 0,
          isActive: data.isActive ?? true,
          images: data.images?.length
            ? { create: data.images.map((img, i) => ({ url: img.url, altText: img.altText, sortOrder: i })) }
            : undefined,
          variants: data.variants?.length
            ? { create: data.variants.map((v, i) => ({ label: v.label, swatchColor: v.swatchColor, stockQuantity: v.stockQuantity ?? 0, sortOrder: v.sortOrder ?? i })) }
            : undefined,
          collections: data.collectionIds?.length
            ? { create: data.collectionIds.map(cid => ({ collectionId: cid })) }
            : undefined,
        },
        include: { images: true, category: true, variants: { orderBy: { sortOrder: "asc" } }, collections: { include: { collection: true } } },
      });
    });

    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/sale");
    return NextResponse.json({ product, message: "Product created" }, { status: 201 });
  } catch (error) {
    console.error("[admin/products POST] failed:", error);
    return NextResponse.json({ error: "Failed to create product. Please try again.", code: "CREATE_ERROR" }, { status: 500 });
  }
}

/**
 * GET /api/admin/products — list products with filtering, pagination.
 * Query params: page, limit, search, category, stock (all/in/low/out), sort (newest/price-asc/price-desc/name)
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)));
    const search = searchParams.get("search") ?? "";
    const categorySlug = searchParams.get("category") ?? "";
    const stockFilter = searchParams.get("stock") ?? "all";
    const sort = searchParams.get("sort") ?? "newest";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    // Phase 3F: Use Prisma.ProductWhereInput for compile-time type safety.
    const where: Prisma.ProductWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
      ];
    }
    if (categorySlug && categorySlug !== "all") {
      where.category = { slug: categorySlug };
    }
    if (stockFilter === "in") { where.inStock = true; where.stockQuantity = { gt: 5 }; }
    else if (stockFilter === "low") { where.stockQuantity = { lte: 5, gt: 0 }; where.inStock = true; }
    else if (stockFilter === "out") { where.OR = [{ stockQuantity: 0 }, { inStock: false }]; }

    // Price range filter
    if (minPrice || maxPrice) {
      const priceFilter: { gte?: number; lte?: number } = {};
      if (minPrice) priceFilter.gte = Number(minPrice);
      if (maxPrice) priceFilter.lte = Number(maxPrice);
      where.price = priceFilter;
    }

    let orderBy: Record<string, string> = {};
    switch (sort) {
      case "price-asc": orderBy = { price: "asc" }; break;
      case "price-desc": orderBy = { price: "desc" }; break;
      case "name": orderBy = { name: "asc" }; break;
      default: orderBy = { createdAt: "desc" };
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where, orderBy, skip: (page - 1) * limit, take: limit,
        include: { category: true, images: { orderBy: { sortOrder: "asc" } }, variants: { orderBy: { sortOrder: "asc" } } },
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({
      products: products.map(p => ({
        id: p.id, slug: p.slug, name: p.name, price: Number(p.price),
        stockQuantity: p.stockQuantity, inStock: p.inStock, isActive: p.isActive,
        featured: p.featured,
        category: p.category ? { name: p.category.name, slug: p.category.slug } : null,
        images: p.images.map(i => i.url),
        variantCount: p.variants.length,
      })),
      total, page, limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[admin/products GET] failed:", error);
    return NextResponse.json({ error: "Failed to load products.", code: "FETCH_ERROR" }, { status: 500 });
  }
}

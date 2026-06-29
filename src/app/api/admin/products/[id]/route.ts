import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { getAccessToken } from "@/lib/auth-cookies";
import { deleteFromCloudinary } from "@/lib/cloudinary";

const ProductUpdateSchema = z.object({
  slug: z.string().min(2).max(120).regex(/^[a-z0-9-]+$/).optional(),
  name: z.string().min(2).max(200).optional(),
  subtitle: z.string().max(200).nullable().optional(),
  description: z.string().min(1).max(2000).optional(),
  longDescription: z.string().max(8000).nullable().optional(),
  price: z.number().nonnegative().optional(),
  compareAtPrice: z.number().nonnegative().nullable().optional(),
  categorySlug: z.string().nullable().optional(),
  badge: z.string().max(60).nullable().optional(),
  inStock: z.boolean().optional(),
  stockQuantity: z.number().int().nonnegative().optional(),
  materials: z.array(z.string()).optional(),
  dimensions: z.string().max(200).nullable().optional(),
  careInstructions: z.string().max(2000).nullable().optional(),
  featured: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
  images: z.array(z.object({ url: z.string().url(), altText: z.string().optional() })).optional(),
});

async function requireAdmin(request: NextRequest) {
  const token = getAccessToken(request);
  if (!token) return null;
  try {
    const payload = verifyToken(token);
    if (payload.role !== "admin") return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * GET /api/admin/products/[id]
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin(request);
    if (!auth) return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });

    const { id } = await params;
    const product = await db.product.findUnique({
      where: { id },
      include: { category: true, images: { orderBy: { sortOrder: "asc" } }, variants: true },
    });
    if (!product) return NextResponse.json({ error: "Not found", code: "NOT_FOUND" }, { status: 404 });

    return NextResponse.json({
      ...product,
      price: Number(product.price),
      compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
      categorySlug: product.category?.slug ?? null,
      images: product.images.map(i => ({ id: i.id, url: i.url, altText: i.altText, sortOrder: i.sortOrder })),
    });
  } catch (error) {
    console.error("[admin/products/[id] GET] failed:", error);
    return NextResponse.json({ error: "Failed", code: "FETCH_ERROR" }, { status: 500 });
  }
}

/**
 * PUT /api/admin/products/[id]
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin(request);
    if (!auth) return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });

    const { id } = await params;
    const body = await request.json();
    const parsed = ProductUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation failed", code: "VALIDATION_ERROR" }, { status: 400 });
    }
    const data = parsed.data;

    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found", code: "NOT_FOUND" }, { status: 404 });

    // Resolve category if provided
    let categoryId: string | null | undefined = undefined;
    if (data.categorySlug !== undefined) {
      if (data.categorySlug === null) {
        categoryId = null;
      } else {
        const cat = await db.category.findUnique({ where: { slug: data.categorySlug } });
        if (!cat) return NextResponse.json({ error: "Category not found", code: "NOT_FOUND" }, { status: 400 });
        categoryId = cat.id;
      }
    }

    // Slug uniqueness check (if changing)
    if (data.slug && data.slug !== existing.slug) {
      const conflict = await db.product.findUnique({ where: { slug: data.slug } });
      if (conflict) return NextResponse.json({ error: "Slug already in use", code: "CONFLICT" }, { status: 409 });
    }

    // Replace images if provided
    if (data.images) {
      await db.productImage.deleteMany({ where: { productId: id } });
      if (data.images.length > 0) {
        await db.productImage.createMany({
          data: data.images.map((img, i) => ({ productId: id, url: img.url, altText: img.altText ?? null, sortOrder: i })),
        });
      }
    }

    const product = await db.product.update({
      where: { id },
      data: {
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.name !== undefined && { name: data.name }),
        ...(data.subtitle !== undefined && { subtitle: data.subtitle }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.longDescription !== undefined && { longDescription: data.longDescription }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.compareAtPrice !== undefined && { compareAtPrice: data.compareAtPrice }),
        ...(categoryId !== undefined && { categoryId }),
        ...(data.badge !== undefined && { badge: data.badge }),
        ...(data.inStock !== undefined && { inStock: data.inStock }),
        ...(data.stockQuantity !== undefined && { stockQuantity: data.stockQuantity }),
        ...(data.materials !== undefined && { materials: data.materials }),
        ...(data.dimensions !== undefined && { dimensions: data.dimensions }),
        ...(data.careInstructions !== undefined && { careInstructions: data.careInstructions }),
        ...(data.featured !== undefined && { featured: data.featured }),
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      include: { category: true, images: { orderBy: { sortOrder: "asc" } } },
    });

    return NextResponse.json({ product, message: "Product updated" });
  } catch (error) {
    console.error("[admin/products/[id] PUT] failed:", error);
    return NextResponse.json({ error: "Failed to update", code: "UPDATE_ERROR" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/products/[id] — soft delete (set isActive=false).
 * Per BACKEND_RULES.md rule 14: soft delete only.
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin(request);
    if (!auth) return NextResponse.json({ error: "Forbidden", code: "FORBIDDEN" }, { status: 403 });

    const { id } = await params;
    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Not found", code: "NOT_FOUND" }, { status: 404 });

    await db.product.update({ where: { id }, data: { isActive: false, inStock: false } });

    // Best-effort cleanup of associated Cloudinary images (do not block on failure)
    try {
      const images = await db.productImage.findMany({ where: { productId: id } });
      for (const img of images) {
        const publicId = extractPublicId(img.url);
        if (publicId) await deleteFromCloudinary(publicId);
      }
    } catch {
      // ignore — soft delete already succeeded
    }

    return NextResponse.json({ message: "Product deactivated (soft delete)" });
  } catch (error) {
    console.error("[admin/products/[id] DELETE] failed:", error);
    return NextResponse.json({ error: "Failed to delete", code: "DELETE_ERROR" }, { status: 500 });
  }
}

/** Extract the Cloudinary public_id from a secure_url, best-effort. */
function extractPublicId(url: string): string | null {
  // URL format: https://res.cloudinary.com/<cloud>/image/upload/<optional transformations>/v<version>/<folder>/<file>.<ext>
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)$/);
  if (!match) return null;
  const path = match[1];
  const dotIdx = path.lastIndexOf(".");
  return dotIdx >= 0 ? path.slice(0, dotIdx) : path;
}

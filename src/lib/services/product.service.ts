/**
 * Product Service — central data access layer for all product reads.
 *
 * Returns DTOs (view models) — not raw Prisma models. This ensures:
 * 1. Consistent field names across all consumers (no more category vs categoryId)
 * 2. Decimal fields are converted to numbers (Prisma returns Decimal objects)
 * 3. Only needed fields are selected (no over-fetching)
 * 4. No duplicate queries — all product reads go through here
 */

import { db } from "@/lib/db";
import type { Product } from "@/types";
import { parseBadgeKind } from "@/types";

import type { Prisma } from "@prisma/client";

// ── DTO Types ──────────────────────────────────────────────────────────

export type ProductListItem = Pick<
  Product,
  "id" | "slug" | "name" | "subtitle" | "price" | "compareAtPrice" | "badge" | "inStock" | "featured" | "materials"
> & {
  category: string;
  images: string[];
  variants: { id: string; label: string; swatch?: string }[];
  dimensions?: string;
  careInstructions?: string;
  description: string;
  longDescription?: string;
};

export type ProductDetail = ProductListItem & {
  stockQuantity: number;
  reviews: Array<{
    id: string;
    authorName: string;
    authorLocation: string | null;
    rating: number;
    title: string | null;
    body: string;
    verifiedBuyer: boolean;
    helpfulCount: number;
    createdAt: string;
  }>;
};

export interface ProductFilters {
  category?: string;
  collection?: string;
  sort?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// ── Helpers ───────────────────────────────────────────────────────────

/**
 * Map a Prisma product (with relations) to the ProductListItem DTO.
 *
 * Phase 3: Exported so other services + tests can reuse it.
 * Previously this was private — Phase 3D refactored the duplicated transforms
 * in 4 consumers (product/[slug]/page.tsx, api/products/route.ts,
 * api/products/[slug]/route.ts, sitemap.ts) to call this directly.
 */
export function toListItem(
  p: {
    id: string;
    slug: string;
    name: string;
    subtitle: string | null;
    description: string;
    longDescription: string | null;
    price: { toNumber: () => number } | number;
    compareAtPrice: { toNumber: () => number } | number | null;
    badge: string | null;
    inStock: boolean;
    stockQuantity: number;
    featured: boolean;
    materials: string[];
    dimensions: string | null;
    careInstructions: string | null;
    category: { slug: string } | null;
    images: { url: string }[];
    variants: { id: string; label: string; swatchColor: string | null }[];
  }
): ProductListItem {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    subtitle: p.subtitle ?? undefined,
    description: p.description,
    longDescription: p.longDescription ?? undefined,
    price: typeof p.price === "number" ? p.price : p.price.toNumber(),
    compareAtPrice: p.compareAtPrice ? (typeof p.compareAtPrice === "number" ? p.compareAtPrice : p.compareAtPrice.toNumber()) : undefined,
    badge: parseBadgeKind(p.badge),
    // Auto-derive inStock: a product is in stock ONLY if inStock=true AND stockQuantity > 0.
    // This prevents showing "Add to Cart" when stockQuantity is 0 even if inStock flag is true,
    // and prevents showing "Sold Out" when stockQuantity > 0 even if inStock flag is false.
    inStock: p.inStock && p.stockQuantity > 0,
    featured: p.featured,
    materials: p.materials,
    dimensions: p.dimensions ?? undefined,
    careInstructions: p.careInstructions ?? undefined,
    category: p.category?.slug ?? "",
    images: p.images.map((img) => img.url),
    variants: p.variants.map((v) => ({
      id: v.id,
      label: v.label,
      swatch: v.swatchColor ?? undefined,
    })),
  };
}

/** Shared select for list queries — only fields the UI card needs. */
const LIST_SELECT = {
  id: true,
  slug: true,
  name: true,
  subtitle: true,
  description: true,
  longDescription: true,
  price: true,
  compareAtPrice: true,
  badge: true,
  inStock: true,
  stockQuantity: true,
  featured: true,
  materials: true,
  dimensions: true,
  careInstructions: true,
  category: { select: { slug: true } },
  images: { select: { url: true }, orderBy: { sortOrder: "asc" as const } },
  variants: {
    select: { id: true, label: true, swatchColor: true },
    orderBy: { sortOrder: "asc" as const },
  },
} as const;

// ── Public Methods ─────────────────────────────────────────────────────

/**
 * Get all active products with optional filters.
 * Used by: Shop page (server-side), /api/products (API route)
 */
export async function getAll(filters: ProductFilters = {}): Promise<{
  products: ProductListItem[];
  total: number;
  page: number;
  limit: number;
}> {
  const {
    category,
    collection,
    sort = "featured",
    search,
    page = 1,
    limit = 100,
  } = filters;

  // Phase 3F: Use Prisma.ProductWhereInput for compile-time field/operator checking.
  // Previously this was `Record<string, unknown>` which allowed typos like
  // `where.categry = ...` to slip through to runtime.
  const where: Prisma.ProductWhereInput = { isActive: true };
  if (category && category !== "all") where.category = { slug: category };
  if (collection) where.collections = { some: { collection: { slug: collection } } };
  if (search)
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { subtitle: { contains: search, mode: "insensitive" } },
    ];

  let orderBy: Prisma.ProductOrderByWithRelationInput = {};
  switch (sort) {
    case "price-asc": orderBy = { price: "asc" }; break;
    case "price-desc": orderBy = { price: "desc" }; break;
    case "newest": orderBy = { createdAt: "desc" }; break;
    default: orderBy = { sortOrder: "asc" };
  }

  try {
    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: LIST_SELECT,
      }),
      db.product.count({ where }),
    ]);

    return {
      products: products.map(toListItem),
      total,
      page,
      limit,
    };
  } catch {
    return { products: [], total: 0, page, limit };
  }
}

/**
 * Get a single product by slug — with reviews, for the detail page.
 * Used by: Product detail page (server-side), /api/products/[slug] (API route)
 */
export async function getBySlug(slug: string): Promise<ProductDetail | null> {
  try {
    const product = await db.product.findUnique({
      where: { slug, isActive: true },
      select: {
        ...LIST_SELECT,
        stockQuantity: true,
        reviews: {
          where: { status: "approved" },
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            authorName: true,
            authorLocation: true,
            rating: true,
            title: true,
            body: true,
            verifiedBuyer: true,
            helpfulCount: true,
            createdAt: true,
          },
        },
      },
    });

    if (!product) return null;

    return {
      ...toListItem(product),
      stockQuantity: product.stockQuantity,
      reviews: product.reviews.map((r) => ({
        id: r.id,
        authorName: r.authorName,
        authorLocation: r.authorLocation,
        rating: r.rating,
        title: r.title,
        body: r.body,
        verifiedBuyer: r.verifiedBuyer,
        helpfulCount: r.helpfulCount,
        createdAt: r.createdAt.toISOString(),
      })),
    };
  } catch {
    return null;
  }
}

/**
 * Get featured products.
 * Used by: Home page (server-side), /api/products/featured (API route)
 */
export async function getFeatured(limit = 8): Promise<ProductListItem[]> {
  try {
    const products = await db.product.findMany({
      where: { isActive: true, featured: true },
      orderBy: { sortOrder: "asc" },
      take: limit,
      select: LIST_SELECT,
    });
    return products.map(toListItem);
  } catch {
    return [];
  }
}

/**
 * Get all products on sale (compareAtPrice > price).
 * Used by: Sale page (server-side), /api/products/sale (API route)
 */
export async function getOnSale(): Promise<ProductListItem[]> {
  try {
    const products = await db.product.findMany({
      where: { isActive: true, compareAtPrice: { not: null } },
      select: LIST_SELECT,
    });

    return products
      .filter((p) => {
        if (!p.compareAtPrice) return false;
        const price = typeof p.price === "number" ? p.price : p.price.toNumber();
        const compareAt = typeof p.compareAtPrice === "number" ? p.compareAtPrice : p.compareAtPrice.toNumber();
        return compareAt > price;
      })
      .map(toListItem)
      .sort((a, b) => {
        const discountA = a.compareAtPrice ? (a.compareAtPrice - a.price) / a.compareAtPrice : 0;
        const discountB = b.compareAtPrice ? (b.compareAtPrice - b.price) / b.compareAtPrice : 0;
        return discountB - discountA;
      });
  } catch {
    return [];
  }
}

/**
 * Search products by query.
 * Used by: Search overlay (client-side), /api/products/search (API route)
 */
export async function search(query: string): Promise<ProductListItem[]> {
  if (!query || query.trim().length < 2) return [];

  try {
    const products = await db.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { subtitle: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 6,
      select: LIST_SELECT,
    });

    return products.map(toListItem);
  } catch {
    return [];
  }
}

/**
 * Get related products (same category, excluding current).
 * Used by: Product detail page (server-side)
 */
export async function getRelated(slug: string, limit = 4): Promise<ProductListItem[]> {
  try {
    const current = await db.product.findUnique({
      where: { slug },
      select: { categoryId: true },
    });

    if (!current?.categoryId) return [];

    const products = await db.product.findMany({
      where: {
        isActive: true,
        categoryId: current.categoryId,
        slug: { not: slug },
      },
      take: limit,
      orderBy: { sortOrder: "asc" },
      select: LIST_SELECT,
    });

    return products.map(toListItem);
  } catch {
    return [];
  }
}

/**
 * Get all unique materials across active products.
 * Used by: Filter sidebar (client-side), /api/products/materials (API route)
 */
export async function getAllMaterials(): Promise<string[]> {
  try {
    const products = await db.product.findMany({
      where: { isActive: true },
      select: { materials: true },
    });
    const materialSet = new Set<string>();
    products.forEach((p) => p.materials.forEach((m) => materialSet.add(m)));
    return Array.from(materialSet).sort();
  } catch {
    return [];
  }
}

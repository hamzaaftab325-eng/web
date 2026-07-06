/**
 * Collection Service — central data access for collection reads.
 */

import { db } from "@/lib/db";

export interface CollectionDTO {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  heroImage: string | null;
  sortOrder: number;
  isActive: boolean;
  productSlugs: string[];
  productCount: number;
}

/**
 * Get all active collections with their product slugs.
 * Used by: Collections page, home CuratedCollection, shop filter
 */
export async function getAll(): Promise<CollectionDTO[]> {
  try {
    const collections = await db.collection.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        products: {
          select: { product: { select: { slug: true } } },
          where: { product: { isActive: true } },
        },
        _count: { select: { products: { where: { product: { isActive: true } } } } },
      },
    });

    return collections.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: c.description,
      heroImage: c.heroImage,
      sortOrder: c.sortOrder,
      isActive: c.isActive,
      productSlugs: c.products.map((p) => p.product.slug),
      productCount: c._count.products,
    }));
  } catch {
    return [];
  }
}

/**
 * Get a single collection by slug.
 */
export async function getBySlug(slug: string): Promise<CollectionDTO | null> {
  try {
    const collection = await db.collection.findUnique({
      where: { slug, isActive: true },
      include: {
        products: {
          select: { product: { select: { slug: true } } },
          where: { product: { isActive: true } },
        },
        _count: { select: { products: { where: { product: { isActive: true } } } } },
      },
    });

    if (!collection) return null;

    return {
      id: collection.id,
      slug: collection.slug,
      name: collection.name,
      description: collection.description,
      heroImage: collection.heroImage,
      sortOrder: collection.sortOrder,
      isActive: collection.isActive,
      productSlugs: collection.products.map((p) => p.product.slug),
      productCount: collection._count.products,
    };
  } catch {
    return null;
  }
}

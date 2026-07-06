/**
 * Category Service — central data access for category reads.
 */

import { db } from "@/lib/db";

export interface CategoryDTO {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  heroImage: string | null;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
}

/**
 * Get all active categories with product counts.
 * Used by: Category showcase (home), Shop filter sidebar, /api/categories
 */
export async function getAll(): Promise<CategoryDTO[]> {
  try {
    const categories = await db.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { products: { where: { isActive: true } } } },
      },
    });

    return categories.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: c.description,
      heroImage: c.heroImage,
      sortOrder: c.sortOrder,
      isActive: c.isActive,
      productCount: c._count.products,
    }));
  } catch {
    return [];
  }
}

/**
 * Get a single category by slug.
 */
export async function getBySlug(slug: string): Promise<CategoryDTO | null> {
  try {
    const category = await db.category.findUnique({
      where: { slug, isActive: true },
      include: {
        _count: { select: { products: { where: { isActive: true } } } },
      },
    });

    if (!category) return null;

    return {
      id: category.id,
      slug: category.slug,
      name: category.name,
      description: category.description,
      heroImage: category.heroImage,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
      productCount: category._count.products,
    };
  } catch {
    return null;
  }
}

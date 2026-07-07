import { z } from "zod";

/**
 * Product CRUD Zod schemas.
 *
 * Used by:
 *   - POST /api/admin/products (create)
 *   - PUT /api/admin/products/[id] (update)
 *   - POST /api/admin/products/import (CSV row validation, future)
 */

/**
 * POST /api/admin/products — create a new product.
 */
export const createProductSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().min(1).max(2000),
  longDescription: z.string().max(8000).optional().nullable(),
  price: z.number().min(0, "Price cannot be negative"),
  compareAtPrice: z.number().min(0).optional().nullable(),
  stockQuantity: z.number().int().min(0).default(0),
  inStock: z.boolean().default(true),
  isActive: z.boolean().default(true),
  featured: z.boolean().default(false),
  categoryId: z.string().min(1, "Category is required"),
  badge: z.string().max(50).optional().nullable(),
  materials: z.array(z.string().max(100)).default([]),
  dimensions: z.string().max(200).optional().nullable(),
  careInstructions: z.string().max(2000).optional().nullable(),
  images: z
    .array(
      z.object({
        url: z.string().url("Image URL must be valid"),
        altText: z.string().max(200).optional().nullable(),
        sortOrder: z.number().int().min(0).default(0),
      }),
    )
    .default([]),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

/**
 * PUT /api/admin/products/[id] — update an existing product.
 * All fields optional — partial updates allowed.
 */
export const updateProductSchema = createProductSchema.partial();

export type UpdateProductInput = z.infer<typeof updateProductSchema>;

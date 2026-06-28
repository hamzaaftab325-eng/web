/**
 * Products API — product catalog endpoints.
 *
 * When IS_MOCK is true (no NEXT_PUBLIC_API_URL set), falls back to
 * local mock data from src/data/products.ts. When a real backend is
 * configured, fetches from the API.
 */

import { IS_MOCK, api } from "./client";
import { products, productBySlug, productsByCategory, productsByCollection, featuredProducts, allMaterials } from "@/data/products";
import type { Product } from "@/types";

export interface ProductFilters {
  category?: string;
  collection?: string;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
  materials?: string[];
  inStock?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
}

/** Get all products with optional filters. */
export async function getProducts(filters?: ProductFilters): Promise<ProductListResponse> {
  if (IS_MOCK) {
    let result = [...products];

    if (filters?.category && filters.category !== "all") {
      result = result.filter((p) => p.category === filters.category);
    }
    if (filters?.collection) {
      result = result.filter((p) => p.collections?.includes(filters.collection as never));
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.includes(q) ||
          p.subtitle?.toLowerCase().includes(q)
      );
    }
    if (filters?.materials && filters.materials.length > 0) {
      result = result.filter((p) =>
        p.materials?.some((m) => filters.materials!.includes(m))
      );
    }
    if (filters?.inStock !== undefined) {
      result = result.filter((p) => p.inStock === filters.inStock);
    }

    // Sort
    if (filters?.sort) {
      switch (filters.sort) {
        case "price-asc": result.sort((a, b) => a.price - b.price); break;
        case "price-desc": result.sort((a, b) => b.price - a.price); break;
        case "newest": result.sort((a, b) => b.id.localeCompare(a.id)); break;
        case "best-selling": result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)); break;
        default: break; // "featured" — keep original order
      }
    }

    const total = result.length;
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? result.length;
    const start = (page - 1) * limit;

    return {
      products: result.slice(start, start + limit),
      total,
      page,
      limit,
    };
  }

  return api.get<ProductListResponse>("/products", {
    params: {
      category: filters?.category,
      collection: filters?.collection,
      sort: filters?.sort,
      minPrice: filters?.minPrice,
      maxPrice: filters?.maxPrice,
      inStock: filters?.inStock,
      search: filters?.search,
      page: filters?.page,
      limit: filters?.limit,
    },
  });
}

/** Get a single product by slug. */
export async function getProduct(slug: string): Promise<Product | null> {
  if (IS_MOCK) {
    return productBySlug(slug) ?? null;
  }
  return api.get<Product>(`/products/${slug}`);
}

/** Get featured products. */
export async function getFeatured(): Promise<Product[]> {
  if (IS_MOCK) {
    return featuredProducts();
  }
  return api.get<Product[]>("/products/featured");
}

/** Get products by category. */
export async function getProductsByCategory(slug: string): Promise<Product[]> {
  if (IS_MOCK) {
    return productsByCategory(slug);
  }
  return api.get<Product[]>(`/products?category=${slug}`);
}

/** Get products by collection. */
export async function getProductsByCollection(slug: string): Promise<Product[]> {
  if (IS_MOCK) {
    return productsByCollection(slug);
  }
  return api.get<Product[]>(`/products?collection=${slug}`);
}

/** Search products. */
export async function searchProducts(query: string): Promise<Product[]> {
  if (IS_MOCK) {
    const q = query.toLowerCase();
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.includes(q) ||
          p.subtitle?.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }
  return api.get<Product[]>("/products/search", { params: { q: query } });
}

/** Get all unique materials (for filter sidebar). */
export async function getAllMaterials(): Promise<string[]> {
  if (IS_MOCK) {
    return allMaterials();
  }
  return api.get<string[]>("/products/materials");
}

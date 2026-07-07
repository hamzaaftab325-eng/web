import { api } from "./client";

import type { Product } from "@/types";
import type { ProductFilters } from "@/lib/services/product.service";

// Phase 6E: Removed duplicate ProductFilters interface — now imported from
// src/lib/services/product.service.ts (the canonical source).

export interface ProductListResponse { products: Product[]; total: number; page: number; limit: number; }

export async function getProducts(filters?: ProductFilters): Promise<ProductListResponse> {
  return api.get<ProductListResponse>("/api/products", { params: { category: filters?.category, collection: filters?.collection, sort: filters?.sort, search: filters?.search, page: filters?.page, limit: filters?.limit } });
}
export async function getProduct(slug: string): Promise<Product | null> { return api.get<Product>(`/api/products/${slug}`); }
export async function getFeatured(): Promise<Product[]> { return api.get<Product[]>("/api/products/featured"); }
export async function searchProducts(query: string): Promise<Product[]> { return api.get<Product[]>("/api/products/search", { params: { q: query } }); }
export async function getAllMaterials(): Promise<string[]> { return api.get<string[]>("/api/products/materials"); }

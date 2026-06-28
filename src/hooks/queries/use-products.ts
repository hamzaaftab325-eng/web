"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProducts, getProduct, getFeatured, searchProducts, getAllMaterials, type ProductFilters } from "@/lib/api/products";
import type { Product } from "@/types";

/** Query keys for cache invalidation. */
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters: ProductFilters) => [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (slug: string) => [...productKeys.details(), slug] as const,
  featured: () => [...productKeys.all, "featured"] as const,
  search: (q: string) => [...productKeys.all, "search", q] as const,
  materials: () => [...productKeys.all, "materials"] as const,
};

/** Fetch product list with filters. */
export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: productKeys.list(filters ?? {}),
    queryFn: () => getProducts(filters),
  });
}

/** Fetch single product by slug. */
export function useProduct(slug: string) {
  return useQuery({
    queryKey: productKeys.detail(slug),
    queryFn: () => getProduct(slug),
    enabled: !!slug,
  });
}

/** Fetch featured products. */
export function useFeaturedProducts() {
  return useQuery({
    queryKey: productKeys.featured(),
    queryFn: () => getFeatured(),
  });
}

/** Search products (debounced by caller). */
export function useProductSearch(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: productKeys.search(query),
    queryFn: () => searchProducts(query),
    enabled: enabled && query.length >= 2,
  });
}

/** Fetch all materials (for filter sidebar). */
export function useAllMaterials() {
  return useQuery({
    queryKey: productKeys.materials(),
    queryFn: () => getAllMaterials(),
  });
}

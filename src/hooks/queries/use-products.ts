"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { getProducts, getFeatured, type ProductFilters } from "@/lib/api/products";
import type { Product } from "@/types";

export const productKeys = {
  all: ["products"] as const,
  list: (f: ProductFilters) => [...productKeys.all, "list", f] as const,
  detail: (s: string) => [...productKeys.all, "detail", s] as const,
  featured: () => [...productKeys.all, "featured"] as const,
  search: (q: string) => [...productKeys.all, "search", q] as const,
  materials: () => [...productKeys.all, "materials"] as const,
};

export function useProducts(filters?: ProductFilters) {
  return useQuery({ queryKey: productKeys.list(filters ?? {}), queryFn: () => getProducts(filters) });
}
export function useFeaturedProducts() {
  return useQuery({ queryKey: productKeys.featured(), queryFn: () => getFeatured() });
}
export function useProductSearch(query: string, enabled = true) {
  return useQuery({ queryKey: productKeys.search(query), queryFn: () => api.get<Product[]>("/api/products/search", { params: { q: query } }), enabled: enabled && query.length >= 2 });
}
export function useAllMaterials() {
  return useQuery({ queryKey: productKeys.materials(), queryFn: () => api.get<string[]>("/api/products/materials") });
}

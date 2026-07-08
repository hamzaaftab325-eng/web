"use client";
import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import type { Product } from "@/types";
export function useProductBySlug(slug: string | null | undefined) {
  return useQuery({ queryKey: ["product", slug], queryFn: () => api.get<Product>(`/api/products/${slug}`), enabled: !!slug });
}
export function useProductsBySlugs(slugs: string[]) {
  const { data, isLoading } = useQuery({
    queryKey: ["products-by-slugs", slugs],
    queryFn: async () => {
      if (!slugs.length) return [];
      const results = await Promise.all(slugs.map((s) => api.get<Product>(`/api/products/${s}`).catch(() => null)));
      return results.filter((p): p is Product => p !== null);
    },
    enabled: slugs.length > 0,
  });
  return { products: data ?? [], isLoading };
}

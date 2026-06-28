"use client";

import { useQuery } from "@tanstack/react-query";
import { getCategories, getCollections } from "@/lib/api/catalog";

/** Fetch all categories. */
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });
}

/** Fetch all collections. */
export function useCollections() {
  return useQuery({
    queryKey: ["collections"],
    queryFn: () => getCollections(),
  });
}

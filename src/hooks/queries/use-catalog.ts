"use client";
import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import type { Category, Collection } from "@/types";
export function useCategories() { return useQuery({ queryKey: ["categories"], queryFn: () => api.get<Category[]>("/api/categories") }); }
export function useCollections() { return useQuery({ queryKey: ["collections"], queryFn: () => api.get<Collection[]>("/api/collections") }); }

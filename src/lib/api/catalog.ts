/**
 * Categories + Collections API.
 */

import { IS_MOCK, api } from "./client";
import { categories } from "@/data/categories";
import { collections } from "@/data/collections";
import type { Category, Collection } from "@/types";

export async function getCategories(): Promise<Category[]> {
  if (IS_MOCK) return categories;
  return api.get<Category[]>("/categories");
}

export async function getCollections(): Promise<Collection[]> {
  if (IS_MOCK) return collections;
  return api.get<Collection[]>("/collections");
}

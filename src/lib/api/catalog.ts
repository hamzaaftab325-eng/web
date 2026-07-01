import { api } from "./client";
import type { Category, Collection } from "@/types";
export async function getCategories(): Promise<Category[]> { return api.get<Category[]>("/api/categories"); }
export async function getCollections(): Promise<Collection[]> { return api.get<Collection[]>("/api/collections"); }

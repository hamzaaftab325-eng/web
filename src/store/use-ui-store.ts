"use client";

import { create } from "zustand";
import type { ActiveFilter, CategorySlug, ViewKey } from "@/types";

export type SortKey =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "best-selling";

interface UIState {
  view: ViewKey;
  activeCategory: CategorySlug | "all";
  activeCollection: string | null;
  activeProductSlug: string | null; // when set, opens ProductDetail modal
  searchOpen: boolean;
  mobileNavOpen: boolean;
  sort: SortKey;
  filters: ActiveFilter[];
  pageLoader: boolean;

  setView: (v: ViewKey) => void;
  setCategory: (c: CategorySlug | "all") => void;
  setCollection: (slug: string | null) => void;
  openProduct: (slug: string | null) => void;
  setSearchOpen: (open: boolean) => void;
  setMobileNavOpen: (open: boolean) => void;
  setSort: (s: SortKey) => void;
  addFilter: (f: ActiveFilter) => void;
  removeFilter: (f: ActiveFilter) => void;
  clearFilters: () => void;
  setPageLoader: (loading: boolean) => void;
  resetShop: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  view: "home",
  activeCategory: "all",
  activeCollection: null,
  activeProductSlug: null,
  searchOpen: false,
  mobileNavOpen: false,
  sort: "featured",
  filters: [],
  pageLoader: false,

  setView: (v) =>
    set({
      view: v,
      mobileNavOpen: false,
      activeProductSlug: null,
      searchOpen: false,
    }),
  setCategory: (c) => set({ activeCategory: c, view: "shop" }),
  setCollection: (slug) =>
    set({ activeCollection: slug, view: "shop", activeCategory: "all" }),
  openProduct: (slug) => set({ activeProductSlug: slug }),
  setSearchOpen: (open) => set({ searchOpen: open }),
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  setSort: (s) => set({ sort: s }),
  addFilter: (f) =>
    set((s) =>
      s.filters.some(
        (x) => x.field === f.field && x.value === f.value
      )
        ? s
        : { filters: [...s.filters, f] }
    ),
  removeFilter: (f) =>
    set((s) => ({
      filters: s.filters.filter(
        (x) => !(x.field === f.field && x.value === f.value)
      ),
    })),
  clearFilters: () => set({ filters: [], activeCategory: "all" }),
  setPageLoader: (loading) => set({ pageLoader: loading }),
  resetShop: () =>
    set({
      activeCategory: "all",
      activeCollection: null,
      filters: [],
      sort: "featured",
    }),
}));

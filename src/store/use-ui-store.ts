"use client";

import { create } from "zustand";

import type { ActiveFilter, CategorySlug, ViewKey } from "@/types";

export type SortKey = "featured" | "newest" | "price-asc" | "price-desc" | "best-selling";

interface UIState {
  view: ViewKey;
  activeCategory: CategorySlug | "all";
  activeCollection: string | null;
  activeProductSlug: string | null;
  quickViewProductSlug: string | null;
  activeArticleSlug: string | null;
  authRedirect: string | null;
  checkoutOpen: boolean;
  searchOpen: boolean;
  mobileNavOpen: boolean;
  filterDrawerOpen: boolean;
  sort: SortKey;
  filters: ActiveFilter[];
  setView: (v: ViewKey) => void;
  setCategory: (c: CategorySlug | "all") => void;
  setCollection: (slug: string | null) => void;
  openProduct: (slug: string | null) => void;
  /** Open the full-page product detail view (replaces the quick-view modal). */
  openProductPage: (slug: string) => void;
  setQuickViewProduct: (slug: string | null) => void;
  openArticle: (slug: string | null) => void;
  setAuthRedirect: (path: string | null) => void;
  setCheckoutOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setMobileNavOpen: (open: boolean) => void;
  setFilterDrawerOpen: (open: boolean) => void;
  setSort: (s: SortKey) => void;
  addFilter: (f: ActiveFilter) => void;
  removeFilter: (f: ActiveFilter) => void;
  clearFilters: () => void;
  resetShop: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  view: "home",
  activeCategory: "all",
  activeCollection: null,
  activeProductSlug: null,
  quickViewProductSlug: null,
  activeArticleSlug: null,
  authRedirect: null,
  checkoutOpen: false,
  searchOpen: false,
  mobileNavOpen: false,
  filterDrawerOpen: false,
  sort: "featured",
  filters: [],
  setView: (v) => set({ view: v, mobileNavOpen: false, filterDrawerOpen: false, activeProductSlug: null, searchOpen: false }),
  setCategory: (c) => set({ activeCategory: c, view: "shop" }),
  setCollection: (slug) => set({ activeCollection: slug, view: "shop", activeCategory: "all" }),
  // openProduct now routes to the full-page PDP. Passing null closes the
  // PDP and returns the shopper to the shop view.
  openProduct: (slug) =>
    set(slug ? { activeProductSlug: slug, view: "product-detail" } : { activeProductSlug: null, view: "shop" }),
  // openProductPage is an explicit alias kept for readability at call sites.
  openProductPage: (slug) =>
    set({ activeProductSlug: slug, view: "product-detail" }),
  setQuickViewProduct: (slug) => set({ quickViewProductSlug: slug }),
  openArticle: (slug) => set({ activeArticleSlug: slug }),
  // Phase 5C: Removed openOrder/activeOrderId — were set but never read by any component.
  setAuthRedirect: (path) => set({ authRedirect: path }),
  setCheckoutOpen: (open) => set({ checkoutOpen: open }),
  setSearchOpen: (open) => set({ searchOpen: open }),
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  setFilterDrawerOpen: (open) => set({ filterDrawerOpen: open }),
  setSort: (s) => set({ sort: s }),
  addFilter: (f) => set((s) => s.filters.some((x) => x.field === f.field && x.value === f.value) ? s : { filters: [...s.filters, f] }),
  removeFilter: (f) => set((s) => ({ filters: s.filters.filter((x) => !(x.field === f.field && x.value === f.value)) })),
  clearFilters: () => set({ filters: [], activeCategory: "all" }),
  resetShop: () => set({ activeCategory: "all", activeCollection: null, filters: [], sort: "featured" }),
}));

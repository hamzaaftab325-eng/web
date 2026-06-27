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
  activeOrderId: string | null;
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
  setQuickViewProduct: (slug: string | null) => void;
  openArticle: (slug: string | null) => void;
  openOrder: (id: string | null) => void;
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
  activeOrderId: null,
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
  openProduct: (slug) => set({ activeProductSlug: slug }),
  setQuickViewProduct: (slug) => set({ quickViewProductSlug: slug }),
  openArticle: (slug) => set({ activeArticleSlug: slug }),
  openOrder: (id) => set({ activeOrderId: id, view: "account-order-detail" }),
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

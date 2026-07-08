"use client";

import { useEffect } from "react";

import { create } from "zustand";

const STORAGE_KEY = "aura-recently-viewed";
const MAX_ITEMS = 8;

interface RecentlyViewedState {
  slugs: string[];
  loaded: boolean;
  add: (slug: string) => void;
  clear: () => void;
  hydrate: () => void;
}

function persist(next: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable or full — fail quietly.
  }
}

// Module-level store so every component using the hook shares one list.
const store = create<RecentlyViewedState>((set, get) => ({
  slugs: [],
  loaded: false,
  add: (slug) => {
    if (!slug) return;
    const next = [slug, ...get().slugs.filter((s) => s !== slug)].slice(0, MAX_ITEMS);
    set({ slugs: next });
    persist(next);
  },
  clear: () => {
    set({ slugs: [] });
    persist([]);
  },
  hydrate: () => {
    if (get().loaded || typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      const safe = Array.isArray(parsed)
        ? parsed.filter((s): s is string => typeof s === "string").slice(0, MAX_ITEMS)
        : [];
      set({ slugs: safe, loaded: true });
    } catch {
      set({ slugs: [], loaded: true });
    }
  },
}));

/**
 * useRecentlyViewed — localStorage-backed "recently viewed" list.
 *
 * Uses the "store information from the previous render" pattern (rather than
 * a useEffect) to trigger the one-time hydration from localStorage. Because
 * the underlying store is module-level, every component using this hook
 * shares the same list — adding a slug from the PDP updates the row at the
 * bottom of the page in the same render pass.
 *
 * - Max 8 items, most recent first.
 * - Re-adding an existing slug moves it to the front.
 */
export function useRecentlyViewed() {
  const slugs = store((s) => s.slugs);
  const loaded = store((s) => s.loaded);
  const add = store((s) => s.add);
  const clear = store((s) => s.clear);
  const hydrate = store((s) => s.hydrate);

  // Hydrate from localStorage on mount (side effect in useEffect, not during render)
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return { slugs, add, clear, loaded };
}

export default useRecentlyViewed;

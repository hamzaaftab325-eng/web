"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface WishlistState {
  slugs: string[];
  isOpen: boolean;
  toggle: (slug: string) => void;
  has: (slug: string) => boolean;
  remove: (slug: string) => void;
  clear: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      slugs: [],
      isOpen: false,
      toggle: (slug) =>
        set((s) => ({
          slugs: s.slugs.includes(slug)
            ? s.slugs.filter((x) => x !== slug)
            : [...s.slugs, slug],
        })),
      has: (slug) => get().slugs.includes(slug),
      remove: (slug) =>
        set((s) => ({ slugs: s.slugs.filter((x) => x !== slug) })),
      clear: () => set({ slugs: [] }),
      openDrawer: () => set({ isOpen: true }),
      closeDrawer: () => set({ isOpen: false }),
    }),
    {
      name: "aura-living-wishlist",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ slugs: s.slugs }),
    }
  )
);

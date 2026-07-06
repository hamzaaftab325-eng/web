"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartLine, Product, ProductVariant } from "@/types";
import { uid } from "@/lib/utils";

interface CartState {
  lines: CartLine[];
  savedForLater: CartLine[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addLine: (
    product: Pick<Product, "id" | "slug" | "name" | "price" | "images" | "stockQuantity">,
    options?: { quantity?: number; variant?: ProductVariant }
  ) => void;
  removeLine: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  increment: (key: string) => void;
  decrement: (key: string) => void;
  saveForLater: (key: string) => void;
  moveToCart: (key: string) => void;
  moveToWishlist: (key: string) => void;
  clear: () => void;
  subtotal: () => number;
  count: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      savedForLater: [],
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),

      addLine: (product, options) => {
        const quantity = options?.quantity ?? 1;
        const variant = options?.variant;
        const variantLabel = variant?.label;
        const key = variant
          ? `${product.id}__${variant.id}`
          : product.id;

        set((state) => {
          const existing = state.lines.find((l) => l.key === key);
          const maxStock = product.stockQuantity;
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.key === key
                  ? { ...l, quantity: maxStock ? Math.min(l.quantity + quantity, maxStock) : l.quantity + quantity }
                  : l
              ),
              isOpen: true,
            };
          }
          const cappedQuantity = maxStock ? Math.min(quantity, maxStock) : quantity;
          const line: CartLine = {
            key,
            productId: product.id,
            slug: product.slug,
            name: product.name,
            image: product.images[0],
            price: product.price,
            variantLabel,
            quantity: cappedQuantity,
            stockQuantity: maxStock,
          };
          return { lines: [...state.lines, line], isOpen: true };
        });
      },

      removeLine: (key) => {
        set((s) => ({ lines: s.lines.filter((l) => l.key !== key) }));
      },

      setQuantity: (key, quantity) =>
        set((s) => ({
          lines: s.lines.map((l) =>
            l.key === key
              ? { ...l, quantity: l.stockQuantity ? Math.min(Math.max(1, quantity), l.stockQuantity) : Math.max(1, quantity) }
              : l
          ),
        })),

      increment: (key) =>
        set((s) => ({
          lines: s.lines.map((l) =>
            l.key === key
                  ? { ...l, quantity: l.stockQuantity ? Math.min(l.quantity + 1, l.stockQuantity) : l.quantity + 1 }
                  : l
          ),
        })),

      decrement: (key) =>
        set((s) => ({
          lines: s.lines
            .map((l) =>
              l.key === key ? { ...l, quantity: l.quantity - 1 } : l
            )
            .filter((l) => l.quantity > 0),
        })),

      saveForLater: (key) => {
        const line = get().lines.find((l) => l.key === key);
        if (!line) return;
        set((s) => ({
          lines: s.lines.filter((l) => l.key !== key),
          savedForLater: [...s.savedForLater, line],
        }));
      },

      moveToCart: (key) => {
        const line = get().savedForLater.find((l) => l.key === key);
        if (!line) return;
        set((s) => ({
          savedForLater: s.savedForLater.filter((l) => l.key !== key),
          lines: [...s.lines, line],
        }));
      },

      moveToWishlist: (key) => {
        const line = get().lines.find((l) => l.key === key);
        if (!line) return;
        // Import wishlist store lazily to avoid circular dependency
        import("@/store/use-wishlist-store").then((mod) => {
          mod.useWishlistStore.getState().toggle(line.slug);
        });
        set((s) => ({
          lines: s.lines.filter((l) => l.key !== key),
        }));
      },

      clear: () => set({ lines: [] }),
      subtotal: () =>
        get().lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
      count: () => get().lines.reduce((sum, l) => sum + l.quantity, 0),
    }),
    {
      name: "aura-living-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ lines: s.lines, savedForLater: s.savedForLater }),
    }
  )
);

export const newCartKey = uid;

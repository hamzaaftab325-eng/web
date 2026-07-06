"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartLine, Product, ProductVariant } from "@/types";
import { uid } from "@/lib/utils";
import { addToCart, removeFromCart } from "@/lib/analytics/ecommerce";
import { trackCartEvent } from "@/hooks/use-tracking";

interface CartState {
  lines: CartLine[];
  savedForLater: CartLine[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addLine: (
    product: Pick<Product, "id" | "slug" | "name" | "price" | "images">,
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

        addToCart({
          currency: "PKR",
          value: product.price * quantity,
          items: [{
            item_id: product.id,
            item_name: product.name,
            price: product.price,
            quantity,
            item_variant: variantLabel,
          }],
        });

        // Server-side cart event tracking
        trackCartEvent("add_to_cart", product.slug, product.id, quantity);

        set((state) => {
          const existing = state.lines.find((l) => l.key === key);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.key === key ? { ...l, quantity: l.quantity + quantity } : l
              ),
              isOpen: true,
            };
          }
          const line: CartLine = {
            key,
            productId: product.id,
            slug: product.slug,
            name: product.name,
            image: product.images[0],
            price: product.price,
            variantLabel,
            quantity,
          };
          return { lines: [...state.lines, line], isOpen: true };
        });
      },

      removeLine: (key) => {
        const line = get().lines.find((l) => l.key === key);
        if (line) {
          removeFromCart({
            currency: "PKR",
            value: line.price * line.quantity,
            items: [{
              item_id: line.productId,
              item_name: line.name,
              price: line.price,
              quantity: line.quantity,
              item_variant: line.variantLabel,
            }],
          });
          // Server-side cart event tracking
          trackCartEvent("remove_from_cart", line.slug, line.productId, line.quantity);
        }
        set((s) => ({ lines: s.lines.filter((l) => l.key !== key) }));
      },

      setQuantity: (key, quantity) =>
        set((s) => ({
          lines: s.lines.map((l) =>
            l.key === key ? { ...l, quantity: Math.max(1, quantity) } : l
          ),
        })),

      increment: (key) =>
        set((s) => ({
          lines: s.lines.map((l) =>
            l.key === key ? { ...l, quantity: l.quantity + 1 } : l
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

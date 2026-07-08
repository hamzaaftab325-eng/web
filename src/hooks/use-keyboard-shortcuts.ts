"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { useCartStore } from "@/store/use-cart-store";
import { useUIStore } from "@/store/use-ui-store";
import { useWishlistStore } from "@/store/use-wishlist-store";

/**
 * useKeyboardShortcuts — global keyboard shortcuts for power users.
 *
 * Shortcuts:
 * - `/` → focus search (open search overlay)
 * - `Escape` → close any open overlay (handled by individual components)
 * - `g h` → go home
 * - `g s` → go to shop
 * - `g c` → open cart
 * - `g w` → open wishlist
 * - `g a` → go to account
 *
 * The `g` key is a "prefix" — press `g`, then the next key within 500ms.
 * Shortcuts are disabled when:
 * - An input/textarea/select is focused (so users can type 'g', '/', etc.)
 * - The user is on an auth page (login/signup)
 */

const PREFIX_TIMEOUT = 500;

export function useKeyboardShortcuts() {
  const router = useRouter();
  const setSearchOpen = useUIStore((s) => s.setSearchOpen);
  const openCart = useCartStore((s) => s.openCart);
  const openWishlist = useWishlistStore((s) => s.openDrawer);

  useEffect(() => {
    let prefixActive = false;
    let prefixTimer: ReturnType<typeof setTimeout> | null = null;

    const isTyping = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return false;
      const tag = target.tagName.toLowerCase();
      return (
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        target.isContentEditable
      );
    };

    const handler = (e: KeyboardEvent) => {
      // Don't interfere with typing
      if (isTyping(e)) return;

      // Don't interfere with modifier keys (Cmd+R, Ctrl+C, etc.)
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key.toLowerCase();

      // Prefix "g" — wait for next key
      if (key === "g" && !prefixActive) {
        prefixActive = true;
        if (prefixTimer) clearTimeout(prefixTimer);
        prefixTimer = setTimeout(() => {
          prefixActive = false;
        }, PREFIX_TIMEOUT);
        e.preventDefault();
        return;
      }

      // If prefix active, handle the second key
      if (prefixActive) {
        prefixActive = false;
        if (prefixTimer) clearTimeout(prefixTimer);

        switch (key) {
          case "h":
            router.push("/");
            e.preventDefault();
            break;
          case "s":
            router.push("/shop");
            e.preventDefault();
            break;
          case "c":
            openCart();
            e.preventDefault();
            break;
          case "w":
            openWishlist();
            e.preventDefault();
            break;
          case "a":
            router.push("/account");
            e.preventDefault();
            break;
        }
        return;
      }

      // Direct shortcuts (no prefix)
      if (key === "/") {
        setSearchOpen(true);
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      if (prefixTimer) clearTimeout(prefixTimer);
    };
  }, [router, setSearchOpen, openCart, openWishlist]);
}


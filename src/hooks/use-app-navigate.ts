"use client";

import { useRouter } from "next/navigation";
import { useUIStore } from "@/store/use-ui-store";
import { viewToUrl } from "@/lib/view-url";
import type { ViewKey } from "@/types";

/**
 * useAppNavigate — hook for URL-based navigation.
 *
 * Replaces the old Zustand `setView()` pattern with real Next.js
 * router.push() navigation. Also closes any open drawers (mobile nav,
 * filter drawer, search) — matching the old setView behavior.
 *
 * Usage:
 *   const navigate = useAppNavigate();
 *   <button onClick={() => navigate("shop")}>Shop</button>
 *   <button onClick={() => navigate("home")}>Home</button>
 *
 * For product detail, use navigateToProduct(slug) instead.
 */

export function useAppNavigate() {
  const router = useRouter();
  const setMobileNavOpen = useUIStore((s) => s.setMobileNavOpen);
  const setFilterDrawerOpen = useUIStore((s) => s.setFilterDrawerOpen);
  const setSearchOpen = useUIStore((s) => s.setSearchOpen);

  const navigate = (view: ViewKey) => {
    const url = viewToUrl(view);
    if (url) {
      router.push(url);
    }
    // Close all drawers (matches old setView behavior)
    setMobileNavOpen(false);
    setFilterDrawerOpen(false);
    setSearchOpen(false);
  };

  return navigate;
}

/**
 * useNavigateToProduct — hook for navigating to a product detail page.
 *
 * Replaces the old `openProduct(slug)` Zustand pattern with real
 * URL-based navigation to /product/[slug].
 */
export function useNavigateToProduct() {
  const router = useRouter();
  const addToRecentlyViewed = useUIStore((s) => s); // just to access store if needed

  const navigateToProduct = (slug: string) => {
    if (slug) {
      router.push(`/product/${slug}`);
    }
  };

  return navigateToProduct;
}

/**
 * useNavigateBack — hook for "back to results" / "back to shop" buttons.
 *
 * Uses router.back() if there's history, otherwise pushes to fallback URL.
 */
export function useNavigateBack() {
  const router = useRouter();

  const navigateBack = (fallback: ViewKey = "shop") => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      const url = viewToUrl(fallback);
      if (url) router.push(url);
    }
  };

  return navigateBack;
}

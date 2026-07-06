"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface WishlistState {
  slugs: string[];
  isOpen: boolean;
  /** Whether the server wishlist has been hydrated at least once in this session.
   *  Used to avoid redundant fetches. */
  hydrated: boolean;
  toggle: (slug: string) => void;
  has: (slug: string) => boolean;
  remove: (slug: string) => void;
  clear: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  /** Merge server wishlist with local wishlist. Called on login / app load.
   *  Server wins for conflicts (item exists on server → keep it). */
  hydrateFromServer: (serverSlugs: string[]) => void;
  /** Mark that hydration has completed. */
  markHydrated: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      slugs: [],
      isOpen: false,
      hydrated: false,
      toggle: (slug) => {
        const isCurrentlyWished = get().slugs.includes(slug);
        // Optimistic update — UI reflects the change immediately.
        set((s) => ({
          slugs: s.slugs.includes(slug)
            ? s.slugs.filter((x) => x !== slug)
            : [...s.slugs, slug],
        }));
        // Sync to server if user is authenticated (best-effort, fire-and-forget).
        // The auth token is sent automatically via the api client's Authorization
        // header (set in src/lib/api/client.ts). If the user is NOT authenticated,
        // the wishlist lives only in localStorage — that's intentional.
        syncWishlistToServer(slug, isCurrentlyWished ? "remove" : "add");
      },
      has: (slug) => get().slugs.includes(slug),
      remove: (slug) => {
        const wasPresent = get().slugs.includes(slug);
        set((s) => ({ slugs: s.slugs.filter((x) => x !== slug) }));
        if (wasPresent) syncWishlistToServer(slug, "remove");
      },
      clear: () => {
        const previous = get().slugs;
        set({ slugs: [] });
        // Best-effort: clear each on server. If the user isn't authenticated,
        // the calls 401 silently (caught).
        previous.forEach((slug) => syncWishlistToServer(slug, "remove"));
      },
      openDrawer: () => set({ isOpen: true }),
      closeDrawer: () => set({ isOpen: false }),
      hydrateFromServer: (serverSlugs) => {
        // Merge: union of local + server. Server items are kept; local-only
        // items are also kept (will be synced to server on next toggle).
        set((s) => {
          const merged = Array.from(new Set([...s.slugs, ...serverSlugs]));
          return { slugs: merged, hydrated: true };
        });
      },
      markHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "aura-living-wishlist",
      storage: createJSONStorage(() => localStorage),
      // Note: `hydrated` is intentionally NOT persisted — we want it to start
      // as `false` on every page load so we re-fetch from server.
      partialize: (s) => ({ slugs: s.slugs }),
    }
  )
);

/**
 * Sync a single wishlist add/remove to the server. Fire-and-forget —
 * errors are silently ignored (the local state is the source of truth
 * for the UI; the server is a backup for cross-device sync).
 *
 * Only fires if the user has an auth token in localStorage. Guests' wishlists
 * stay local-only.
 */
function syncWishlistToServer(slug: string, action: "add" | "remove"): void {
  if (typeof window === "undefined") return;

  // Check if the user is authenticated by reading the auth store's persisted
  // state directly from localStorage. We can't use the Zustand hook here
  // because this is a plain function, not a React component.
  let token: string | null = null;
  try {
    const raw = localStorage.getItem("aura-living-auth");
    if (raw) {
      const parsed = JSON.parse(raw);
      token = parsed?.state?.token ?? null;
    }
  } catch {
    return; // Malformed auth state — skip sync.
  }

  if (!token) return; // Guest user — wishlist stays local-only.

  const method = action === "add" ? "POST" : "DELETE";
  fetch("/api/user/wishlist", {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productSlug: slug }),
  }).catch(() => {
    // Silent fail — server sync is best-effort. The local wishlist is still
    // correct; we'll retry on next hydration.
  });
}

/**
 * Fetch the server-side wishlist for an authenticated user. Returns null
 * if the user is not authenticated (guest) or the fetch fails.
 *
 * Call this on login and on app startup (if already authenticated).
 */
export async function fetchServerWishlist(): Promise<string[] | null> {
  if (typeof window === "undefined") return null;

  let token: string | null = null;
  try {
    const raw = localStorage.getItem("aura-living-auth");
    if (raw) {
      const parsed = JSON.parse(raw);
      token = parsed?.state?.token ?? null;
    }
  } catch {
    return null;
  }

  if (!token) return null; // Guest — no server wishlist.

  try {
    const response = await fetch("/api/user/wishlist", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return null;
    const data = await response.json();
    return Array.isArray(data) ? data : null;
  } catch {
    return null;
  }
}

/**
 * Hydrate the wishlist store from the server. Call this on login and on
 * app startup (if the user is already authenticated). Safe to call multiple
 * times — it's idempotent.
 */
export async function hydrateWishlist(): Promise<void> {
  const serverSlugs = await fetchServerWishlist();
  if (serverSlugs !== null) {
    useWishlistStore.getState().hydrateFromServer(serverSlugs);
  } else {
    useWishlistStore.getState().markHydrated();
  }
}

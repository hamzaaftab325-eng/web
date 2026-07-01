"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Theme store — manages dark mode, contrast, and font size preferences.
 *
 * Persists to localStorage. On initial load, respects prefers-color-scheme
 * for dark mode (unless user has explicitly chosen).
 *
 * The actual DOM attribute setting happens in ThemeScript (inline script
 * in layout.tsx) to prevent flash of wrong theme.
 */

type ThemeMode = "light" | "dark" | "system";
type ContrastMode = "default" | "high";
type FontSize = "sm" | "md" | "lg";

interface ThemeState {
  mode: ThemeMode;
  contrast: ContrastMode;
  fontSize: FontSize;
  /** Whether the user has explicitly chosen (vs. system default) */
  hasChosen: boolean;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
  setContrast: (contrast: ContrastMode) => void;
  setFontSize: (size: FontSize) => void;
}

function applyTheme(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  const isDark =
    mode === "dark" ||
    (mode === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.setAttribute(
    "data-theme",
    isDark ? "dark" : "light"
  );
}

function applyContrast(contrast: ContrastMode) {
  if (typeof document === "undefined") return;
  if (contrast === "high") {
    document.documentElement.setAttribute("data-contrast", "high");
  } else {
    document.documentElement.removeAttribute("data-contrast");
  }
}

function applyFontSize(size: FontSize) {
  if (typeof document === "undefined") return;
  if (size === "md") {
    document.documentElement.removeAttribute("data-font-size");
  } else {
    document.documentElement.setAttribute("data-font-size", size);
  }
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: "system",
      contrast: "default",
      fontSize: "md",
      hasChosen: false,

      setMode: (mode) => {
        set({ mode, hasChosen: true });
        applyTheme(mode);
      },

      toggle: () => {
        const current = get().mode;
        const isDark =
          current === "dark" ||
          (current === "system" &&
            typeof window !== "undefined" &&
            window.matchMedia("(prefers-color-scheme: dark)").matches);
        const next = isDark ? "light" : "dark";
        set({ mode: next, hasChosen: true });
        applyTheme(next);
      },

      setContrast: (contrast) => {
        set({ contrast });
        applyContrast(contrast);
      },

      setFontSize: (fontSize) => {
        set({ fontSize });
        applyFontSize(fontSize);
      },
    }),
    {
      name: "aura-theme",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        mode: s.mode,
        contrast: s.contrast,
        fontSize: s.fontSize,
        hasChosen: s.hasChosen,
      }),
      // Apply theme on rehydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.mode);
          applyContrast(state.contrast);
          applyFontSize(state.fontSize);
        }
      },
    }
  )
);

/**
 * Initialize theme from store or system preference.
 * Called on app mount — the inline script in layout.tsx handles
 * the very first paint to prevent flash.
 */
export function initTheme() {
  const state = useThemeStore.getState();
  applyTheme(state.mode);
  applyContrast(state.contrast);
  applyFontSize(state.fontSize);

  // Listen for system theme changes if in "system" mode
  if (typeof window !== "undefined" && state.mode === "system") {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }
}

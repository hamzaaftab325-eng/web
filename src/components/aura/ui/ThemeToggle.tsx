"use client";

import { useEffect } from "react";

import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";

import { cn } from "@/lib/utils";
import { useThemeStore } from "@/store/use-theme-store";

/**
 * ThemeToggle — sun/moon icon button that toggles dark/light mode.
 *
 * Respects prefers-color-scheme on first visit (via "system" mode),
 * then persists user choice. Uses the theme store's toggle() which
 * applies the theme immediately + persists to localStorage.
 */

export function ThemeToggle({ className }: { className?: string }) {
  const mode = useThemeStore((s) => s.mode);
  const toggle = useThemeStore((s) => s.toggle);

  // Initialize theme on mount (in case the inline script didn't run)
  useEffect(() => {
    const state = useThemeStore.getState();
    const isDark =
      state.mode === "dark" ||
      (state.mode === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.setAttribute(
      "data-theme",
      isDark ? "dark" : "light"
    );
  }, []);

  const isDark =
    mode === "dark" ||
    (mode === "system" &&
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "p-2 transition-colors hover:text-gold",
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "moon" : "sun"}
          initial={{ opacity: 0, rotate: -90 }}
          animate={{ opacity: 1, rotate: 0 }}
          exit={{ opacity: 0, rotate: 90 }}
          transition={{ duration: 0.2 }}
        >
          {isDark ? (
            <Moon size={18} strokeWidth={1.5} />
          ) : (
            <Sun size={18} strokeWidth={1.5} />
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}

export default ThemeToggle;

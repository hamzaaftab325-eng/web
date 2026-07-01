"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Settings, X, Sun, Moon, Type, Contrast } from "lucide-react";
import { useThemeStore } from "@/store/use-theme-store";
import { cn } from "@/lib/utils";

/**
 * DisplayPreferences — settings panel for accessibility + display options.
 *
 * Opens via a gear icon in the header. Controls:
 * - Theme: Light / Dark / System
 * - Contrast: Default / High
 * - Font size: Small / Medium / Large
 *
 * All settings are token swaps in globals.css (data-theme, data-contrast,
 * data-font-size on <html>) — zero component changes needed.
 */

export function DisplayPreferences({ className }: { className?: string }) {
  const prefersReducedMotion = useReducedMotion();
  const [open, setOpen] = useState(false);

  const { mode, contrast, fontSize, setMode, setContrast, setFontSize } =
    useThemeStore();

  const options = [
    {
      label: "Theme",
      icon: mode === "dark" ? Moon : Sun,
      value: mode,
      options: [
        { value: "light", label: "Light" },
        { value: "dark", label: "Dark" },
        { value: "system", label: "System" },
      ],
      onChange: (v: string) => setMode(v as "light" | "dark" | "system"),
    },
    {
      label: "Contrast",
      icon: Contrast,
      value: contrast,
      options: [
        { value: "default", label: "Default" },
        { value: "high", label: "High" },
      ],
      onChange: (v: string) => setContrast(v as "default" | "high"),
    },
    {
      label: "Text size",
      icon: Type,
      value: fontSize,
      options: [
        { value: "sm", label: "Small" },
        { value: "md", label: "Medium" },
        { value: "lg", label: "Large" },
      ],
      onChange: (v: string) => setFontSize(v as "sm" | "md" | "lg"),
    },
  ];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Display preferences"
        className={cn("p-1 transition-colors hover:text-gold", className)}
      >
        <Settings size={18} strokeWidth={1.5} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-modal flex items-center justify-center p-4 overlay-dark"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="bg-paper w-full max-w-md rounded-sm shadow-modal overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-label="Display preferences"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 h-[60px] border-b border-hairline-cream">
                <h2 className="t-headline-sm c-ink">Display Preferences</h2>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="p-2 c-ink-faint hover:c-gold-deep transition-colors"
                >
                  <X size={18} strokeWidth={1.5} />
                </button>
              </div>

              {/* Options */}
              <div className="p-6 space-y-6">
                {options.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <div key={opt.label}>
                      <div className="flex items-center gap-2 mb-3">
                        <Icon size={14} strokeWidth={1.5} className="c-gold-deep" />
                        <p className="t-label-caps c-ink-faint">{opt.label}</p>
                      </div>
                      <div className="flex gap-2">
                        {opt.options.map((o) => {
                          const isActive = opt.value === o.value;
                          return (
                            <button
                              key={o.value}
                              onClick={() => opt.onChange(o.value)}
                              className={cn(
                                "flex-1 py-2.5 t-body-sm rounded-sm border transition-colors",
                                isActive
                                  ? "bg-gold-deep c-paper border-gold-deep font-medium"
                                  : "c-ink border-hairline-cream hover:border-gold"
                              )}
                            >
                              {o.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default DisplayPreferences;

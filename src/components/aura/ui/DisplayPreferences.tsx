"use client";

import { useState, useEffect, useRef } from "react";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Settings, X, Sun, Moon, Type, Contrast } from "lucide-react";

import { useFocusTrap } from "@/hooks/use-focus-trap";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/store/use-theme-store";

/**
 * DisplayPreferences — settings panel for accessibility + display options.
 *
 * Phase 8B: Added focus trap, Escape key handler, aria-modal, aria-pressed.
 * Previously this modal had none of these — was an accessibility regression
 * vs. other modals (MobileNav, CartDrawer, QuickViewModal).
 */

export function DisplayPreferences({ className }: { className?: string }) {
  const prefersReducedMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const { mode, contrast, fontSize, setMode, setContrast, setFontSize } =
    useThemeStore();

  // Phase 8B: Focus trap
  useFocusTrap(dialogRef, open);

  // Phase 8B: Escape key handler + focus restoration
  useEffect(() => {
    if (!open) return;

    // Phase 11C: Copy ref to local variable for cleanup (fixes exhaustive-deps warning)
    const trigger = triggerRef.current;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      // Restore focus to the trigger button when modal closes
      trigger?.focus();
    };
  }, [open]);

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
        ref={triggerRef}
        onClick={() => setOpen(true)}
        aria-label="Display preferences"
        aria-haspopup="dialog"
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
              ref={dialogRef}
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="bg-paper w-full max-w-md rounded-sm shadow-modal overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Display preferences"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 h-[60px] border-b border-hairline-cream">
                <h2 className="t-headline-sm c-ink">Display Preferences</h2>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close display preferences"
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
                      <div className="flex gap-2" role="group" aria-label={opt.label}>
                        {opt.options.map((o) => {
                          const isActive = opt.value === o.value;
                          return (
                            <button
                              key={o.value}
                              onClick={() => opt.onChange(o.value)}
                              aria-pressed={isActive}
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

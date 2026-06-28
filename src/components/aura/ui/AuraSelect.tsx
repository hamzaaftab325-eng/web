"use client";

import * as React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronDown, Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * AuraSelect — custom dropdown with search, keyboard navigation, and
 * gold-accent styling. Replaces native <select> with a branded experience.
 *
 * Features:
 * - Searchable options (filter as you type)
 * - Keyboard navigation (Arrow Up/Down, Enter, Escape)
 * - Gold accent on focus + selected item
 * - Accessible: aria-expanded, aria-selected, role="listbox"
 * - Honors prefers-reduced-motion
 */

export interface AuraSelectOption {
  value: string;
  label: string;
}

export interface AuraSelectProps {
  label?: string;
  error?: string;
  hint?: string;
  options: AuraSelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  containerClassName?: string;
}

export function AuraSelect({
  label,
  error,
  hint,
  options,
  value,
  onChange,
  placeholder = "Select…",
  searchable = false,
  disabled = false,
  containerClassName,
}: AuraSelectProps) {
  const prefersReducedMotion = useReducedMotion();
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [focusedIndex, setFocusedIndex] = React.useState(-1);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  const filteredOptions = searchable
    ? options.filter((o) =>
        o.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  React.useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  React.useEffect(() => {
    if (open && searchable && searchRef.current) {
      searchRef.current.focus();
    }
  }, [open, searchable]);

  const selectOption = (val: string) => {
    onChange?.(val);
    setOpen(false);
    setSearchQuery("");
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;

    if (e.key === "Escape") {
      setOpen(false);
      setSearchQuery("");
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((i) => Math.min(i + 1, filteredOptions.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === "Enter" && focusedIndex >= 0) {
      e.preventDefault();
      selectOption(filteredOptions[focusedIndex].value);
    }
  };

  return (
    <div className={cn("relative", containerClassName)} ref={containerRef}>
      {label && (
        <label className="t-label-caps c-ink-faint block mb-2">{label}</label>
      )}
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        onKeyDown={onKeyDown}
        aria-expanded={open}
        aria-haspopup="listbox"
        disabled={disabled}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-4 py-3 t-body c-ink bg-transparent border-b transition-colors text-left",
          error
            ? "border-error"
            : open
            ? "border-gold"
            : "border-hairline-strong",
          disabled && "opacity-60 cursor-not-allowed",
          !disabled && "hover:border-gold"
        )}
      >
        <span className={cn(!selectedOption && "c-ink-faint")}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          strokeWidth={1.5}
          className={cn(
            "c-ink-faint transition-transform flex-shrink-0",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full left-0 right-0 z-modal mt-2 bg-paper border border-hairline-cream rounded-sm shadow-elevated overflow-hidden"
            role="listbox"
          >
            {searchable && (
              <div className="flex items-center gap-2 px-3 py-2 border-b border-hairline-cream">
                <Search size={14} strokeWidth={1.5} className="c-ink-faint" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search…"
                  className="flex-1 bg-transparent t-body-sm c-ink outline-none placeholder:c-ink-faint"
                />
              </div>
            )}
            <div className="max-h-[240px] overflow-y-auto scrollbar-thin">
              {filteredOptions.length === 0 ? (
                <p className="t-body-sm c-ink-faint px-4 py-3">No results</p>
              ) : (
                filteredOptions.map((option, i) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => selectOption(option.value)}
                    onMouseEnter={() => setFocusedIndex(i)}
                    role="option"
                    aria-selected={option.value === value}
                    className={cn(
                      "w-full flex items-center justify-between gap-2 px-4 py-2.5 t-body text-left transition-colors",
                      option.value === value
                        ? "c-gold-deep bg-gold-pale/50"
                        : "c-ink hover:bg-cream",
                      focusedIndex === i && "bg-cream"
                    )}
                  >
                    <span>{option.label}</span>
                    {option.value === value && (
                      <Check size={14} strokeWidth={2} className="c-gold-deep" />
                    )}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="t-caption c-error mt-1.5" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="t-caption c-ink-faint mt-1.5">{hint}</p>
      )}
    </div>
  );
}

export default AuraSelect;

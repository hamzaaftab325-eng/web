import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a price for display.
 *
 * All prices in the database are stored in PKR (Pakistani Rupee).
 * The admin enters prices in PKR, the checkout uses PKR, and the
 * storefront displays PKR. No conversion is needed — just format
 * the number with the ₨ symbol and locale grouping.
 *
 * Returns e.g. "₨5,000" for 5000.
 */
export function formatPrice(pkrValue: number): string {
  const formatted = new Intl.NumberFormat("ur-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(pkrValue));
  return `₨${formatted}`;
}

/** Convert a string to a URL-safe slug. */
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** Stable id generator (avoids extra deps). */
export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

/** Clamp a number between min and max. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Sleep helper for simulated async. */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

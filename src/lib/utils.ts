import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a USD price value as PKR (Pakistani Rupee) for server-side rendering.
 * The site's primary currency is PKR. Prices stored in USD, converted at mock
 * rate of 278.5 PKR per USD. Client-side useFormatPrice() upgrades to user's
 * currency choice. Tabular numerals handled via CSS `.t-num`.
 */
const PKR_RATE = 278.5;

export function formatPrice(usdValue: number): string {
  const pkr = Math.round(usdValue * PKR_RATE);
  const formatted = new Intl.NumberFormat("ur-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(pkr);
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

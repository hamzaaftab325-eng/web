/**
 * Server-side currency formatting (for SSR, metadata, JSON-LD).
 *
 * For client-side reactive formatting, use the useCurrencyStore hook
 * which respects the user's currency preference.
 *
 * Default: PKR (₨) at mock rate of 278.5 PKR per USD.
 */

const PKR_RATE = 278.5; // Mock — swap to real API
const USD_TO_PKR = (usd: number) => Math.round(usd * PKR_RATE);

/**
 * Format a USD price as PKR for server-side rendering.
 * Returns e.g. "₨52,718" for $189.
 */
export function formatPricePKR(usdPrice: number): string {
  const pkr = USD_TO_PKR(usdPrice);
  const formatted = new Intl.NumberFormat("ur-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(pkr);
  return `₨${formatted}`;
}

/**
 * Format a USD price as USD (for fallback / JSON-LD).
 */
export function formatPriceUSD(usdPrice: number): string {
  return `$${usdPrice.toFixed(2)}`;
}

/**
 * Default export — format as PKR (the site's primary currency).
 */
export function formatPrice(usdPrice: number): string {
  return formatPricePKR(usdPrice);
}

export { PKR_RATE };

/**
 * Currency formatting for Aura Living.
 *
 * All prices in the database are stored in PKR (Pakistani Rupee).
 * The admin enters prices in PKR, the checkout uses PKR, and the
 * storefront displays PKR. No conversion is needed — just format
 * the number with the ₨ symbol and proper grouping.
 *
 * For future multi-currency support, swap formatPrice to use a
 * currency store that converts PKR → USD/EUR/GBP at the real rate.
 */

/**
 * Format a PKR price with the ₨ symbol and locale grouping.
 * Returns e.g. "₨5,000" for 5000.
 */
export function formatPrice(pkrPrice: number): string {
  const formatted = new Intl.NumberFormat("ur-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(pkrPrice));
  return `₨${formatted}`;
}

/**
 * Alias for formatPrice — kept for backward compatibility.
 */
export const formatPricePKR = formatPrice;

/**
 * Format a price as USD (for JSON-LD structured data).
 * Converts PKR → USD at a fixed rate for SEO purposes only.
 */
const USD_RATE = 278.5; // PKR per USD
export function formatPriceUSD(pkrPrice: number): string {
  const usd = pkrPrice / USD_RATE;
  return `$${usd.toFixed(2)}`;
}

export { USD_RATE };

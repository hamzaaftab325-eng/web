/**
 * Currency formatting for Aura Living.
 *
 * All prices in the database are stored in PKR (Pakistani Rupee).
 * The currency symbol is configurable via the admin settings page.
 *
 * The symbol is loaded lazily — the first call to formatPrice() on the
 * client will use the default "₨". If useSettings() has been called
 * (which happens in AppChrome), it will update the symbol via
 * setCurrencySymbol().
 */

// Module-level currency symbol — can be updated at runtime
let currencySymbol = "₨";

export function setCurrencySymbol(symbol: string) {
  currencySymbol = symbol;
}

/**
 * Format a PKR price with the currency symbol and locale grouping.
 * Returns e.g. "₨5,000" for 5000.
 */
export function formatPrice(pkrPrice: number): string {
  const formatted = new Intl.NumberFormat("ur-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(pkrPrice));
  return `${currencySymbol}${formatted}`;
}
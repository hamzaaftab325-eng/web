"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Currency store — manages the active currency for price display.
 *
 * Supports PKR (Pakistani Rupee) and USD (fallback). The exchange rate
 * is a static mock — swap to a real API (e.g. exchangerate-api.com)
 * by replacing EXCHANGE_RATES with a fetch call.
 *
 * Persists to localStorage. All prices reformat on currency change.
 */

export type CurrencyCode = "PKR" | "USD";

interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  /** ISO 4217 numeric code (for payment processors) */
  numericCode: string;
  /** Number of decimal places to display */
  decimals: number;
  /** Symbol position: before or after the amount */
  symbolPosition: "before" | "after";
  /** Locale for number formatting */
  locale: string;
  /** Exchange rate from USD (1 USD = X currency) */
  rateFromUSD: number;
}

const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  PKR: {
    code: "PKR",
    symbol: "₨",
    numericCode: "586",
    decimals: 0,
    symbolPosition: "before",
    locale: "ur-PK",
    rateFromUSD: 278.5, // Mock rate — 1 USD ≈ 278.5 PKR (update with real API)
  },
  USD: {
    code: "USD",
    symbol: "$",
    numericCode: "840",
    decimals: 2,
    symbolPosition: "before",
    locale: "en-US",
    rateFromUSD: 1,
  },
};

interface CurrencyState {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  /** Convert a USD price to the active currency */
  convert: (usdPrice: number) => number;
  /** Format a USD price in the active currency */
  format: (usdPrice: number) => string;
  /** Get the currency config */
  getConfig: () => CurrencyConfig;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist(
    (set, get) => ({
      currency: "PKR",

      setCurrency: (code) => set({ currency: code }),

      convert: (usdPrice) => {
        const config = CURRENCIES[get().currency];
        return usdPrice * config.rateFromUSD;
      },

      format: (usdPrice) => {
        const config = CURRENCIES[get().currency];
        const converted = usdPrice * config.rateFromUSD;
        const formatted = new Intl.NumberFormat(config.locale, {
          minimumFractionDigits: config.decimals,
          maximumFractionDigits: config.decimals,
        }).format(converted);

        return config.symbolPosition === "before"
          ? `${config.symbol}${formatted}`
          : `${formatted} ${config.symbol}`;
      },

      getConfig: () => CURRENCIES[get().currency],
    }),
    {
      name: "aura-currency",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ currency: s.currency }),
    }
  )
);

export { CURRENCIES };
export default useCurrencyStore;

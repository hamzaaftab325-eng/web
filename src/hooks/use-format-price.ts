"use client";

import { useCallback } from "react";
import { useCurrencyStore } from "@/store/use-currency-store";

/**
 * useFormatPrice — reactive price formatting hook.
 *
 * Returns a formatPrice function that uses the active currency from
 * the currency store. When the user changes currency, all prices
 * reformat automatically.
 *
 * Usage:
 *   const formatPrice = useFormatPrice();
 *   <span>{formatPrice(product.price)}</span>
 *
 * Prices are stored in USD in the data layer; the hook converts
 * to the active currency (PKR or USD) for display.
 */

export function useFormatPrice() {
  const format = useCurrencyStore((s) => s.format);

  return useCallback(
    (usdPrice: number) => format(usdPrice),
    [format]
  );
}

export default useFormatPrice;

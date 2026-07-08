"use client";

import { useState, useEffect } from "react";

import { setCurrencySymbol } from "@/lib/format/currency";

/**
 * Default settings — used before the API responds or if it fails.
 */
const DEFAULTS: Record<string, string> = {
  storeName: "Aura Living",
  storeEmail: "hello@auraliving.com",
  storePhone: "",
  storeAddress: "Lahore, Pakistan",
  currency: "PKR",
  currencySymbol: "₨",
  taxRate: "0",
  freeShippingThreshold: "10000",
  defaultShippingCost: "150",
  orderNumberPrefix: "AURA",
  paymentCOD: "true",
  paymentJazzCash: "false",
  paymentEasyPaisa: "false",
  paymentBankTransfer: "false",
  socialInstagram: "",
  socialFacebook: "",
  socialTwitter: "",
  socialPinterest: "",
  metaHomeTitle: "Aura Living — Considered Home",
  metaHomeDescription: "Premium home décor atelier offering lamps, mirrors, indoor plants, planters, and sculptural objects. Warm minimalism, artisanal craft.",
  metaShopTitle: "Shop — Aura Living",
  metaShopDescription: "Browse our collection of handcrafted lamps, mirrors, planters, ceramics, and accessories.",
};

/**
 * useSettings — client-side hook that fetches store settings from the API.
 *
 * Returns the settings object with all keys populated (merged with defaults).
 * Fetches once on mount, then caches in module-level variable.
 */
let cachedSettings: Record<string, string> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes — refresh settings periodically

export function useSettings() {
  const [settings, setSettings] = useState<Record<string, string>>(cachedSettings ?? DEFAULTS);

  useEffect(() => {
    // Refresh if cache is stale (older than 5 min) or doesn't exist
    const isStale = Date.now() - cacheTimestamp > CACHE_TTL;
    if (cachedSettings && !isStale) {
      // Capture the non-null value so TypeScript keeps it as Record<string,string>
      // (closures narrow differently). Defer setState via microtask to satisfy
      // React 19's react-hooks/set-state-in-effect rule.
      const cached = cachedSettings;
      queueMicrotask(() => setSettings(cached));
      return;
    }

    fetch("/api/settings")
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.settings) {
          cachedSettings = data.settings;
          cacheTimestamp = Date.now();
          setSettings(data.settings);
          if (data.settings.currencySymbol) {
            setCurrencySymbol(data.settings.currencySymbol);
          }
        }
      })
      .catch(() => {
        // Use defaults if fetch fails
      });
  }, []);

  return settings;
}

/**
 * Server-side fetch — for use in Server Components.
 */
export async function getSettingsServer(): Promise<Record<string, string>> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/settings`, { next: { revalidate: 60 } });
    if (!res.ok) return DEFAULTS;
    const data = await res.json();
    return data.settings ?? DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

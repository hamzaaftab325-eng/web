import { db } from "@/lib/db";

/**
 * Settings service — typesafe wrappers around the Setting table.
 *
 * The Setting model stores everything as TEXT (key → value string).
 * Previously, callers did `Number(settings.taxRate ?? "0")` inline —
 * fragile (no validation, NaN risk, scattered parsing).
 *
 * This service:
 *   - Caches settings in-memory for 60 seconds (avoids DB round-trip per request)
 *   - Provides typed getters: getNumber(), getBoolean(), getString()
 *   - Returns sensible defaults if a setting is missing or invalid
 */

interface CachedSettings {
  settings: Record<string, string>;
  cachedAt: number;
}

let _cache: CachedSettings | null = null;
const CACHE_TTL = 60 * 1000; // 60 seconds

/**
 * Fetch all settings from the DB (cached for 60s).
 * Returns an empty object if DB is unreachable.
 */
async function getAllSettings(): Promise<Record<string, string>> {
  if (_cache && Date.now() - _cache.cachedAt < CACHE_TTL) {
    return _cache.settings;
  }

  try {
    const rows = await db.setting.findMany({
      select: { key: true, value: true },
    });
    const settings: Record<string, string> = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    _cache = { settings, cachedAt: Date.now() };
    return settings;
  } catch (error) {
    console.error("[setting.service] Failed to fetch settings:", error);
    return _cache?.settings ?? {};
  }
}

/**
 * Invalidate the settings cache.
 * Call after admin updates settings via /api/admin/settings.
 */
export function invalidateSettingsCache(): void {
  _cache = null;
}

/**
 * Get a string setting.
 */
export async function getString(key: string, defaultValue = ""): Promise<string> {
  const settings = await getAllSettings();
  return settings[key] ?? defaultValue;
}

/**
 * Get a numeric setting.
 * Returns the default if the value is missing or not a valid number.
 */
export async function getNumber(key: string, defaultValue = 0): Promise<number> {
  const settings = await getAllSettings();
  const raw = settings[key];
  if (raw == null || raw === "") return defaultValue;
  const num = Number(raw);
  return Number.isFinite(num) ? num : defaultValue;
}

/**
 * Get a boolean setting.
 * Recognizes "true"/"false" (case-insensitive), "1"/"0", "yes"/"no".
 */
export async function getBoolean(key: string, defaultValue = false): Promise<boolean> {
  const settings = await getAllSettings();
  const raw = settings[key]?.toLowerCase().trim();
  if (raw == null || raw === "") return defaultValue;
  if (["true", "1", "yes", "on"].includes(raw)) return true;
  if (["false", "0", "no", "off"].includes(raw)) return false;
  return defaultValue;
}

// ── Domain-specific convenience getters ──────────────────────────────
// These wrap the generic getters with sensible defaults + key constants
// so callers don't have to remember string keys.

export const SETTING_KEYS = {
  taxRate: "taxRate",
  defaultShippingCost: "defaultShippingCost",
  freeShippingThreshold: "freeShippingThreshold",
  orderNumberPrefix: "orderNumberPrefix",
  paymentCOD: "paymentCOD",
  lowStockThreshold: "lowStockThreshold",
} as const;

/**
 * Tax rate as a decimal (e.g. 0.05 = 5%).
 */
export async function getTaxRate(): Promise<number> {
  // Stored as percentage points (e.g. "5" = 5%) — convert to decimal
  const pct = await getNumber(SETTING_KEYS.taxRate, 0);
  return pct / 100;
}

/**
 * Default shipping cost in PKR.
 */
export async function getDefaultShippingCost(): Promise<number> {
  return getNumber(SETTING_KEYS.defaultShippingCost, 250);
}

/**
 * Free shipping threshold in PKR (orders above this get free shipping).
 * Returns 0 if disabled.
 */
export async function getFreeShippingThreshold(): Promise<number> {
  return getNumber(SETTING_KEYS.freeShippingThreshold, 0);
}

/**
 * Order number prefix (e.g. "AURA-").
 */
export async function getOrderNumberPrefix(): Promise<string> {
  return getString(SETTING_KEYS.orderNumberPrefix, "AURA-");
}

/**
 * Is cash-on-delivery enabled?
 */
export async function isPaymentCodeEnabled(): Promise<boolean> {
  return getBoolean(SETTING_KEYS.paymentCOD, true);
}

/**
 * Low-stock alert threshold (products with stock ≤ this trigger alerts).
 */
export async function getLowStockThreshold(): Promise<number> {
  return getNumber(SETTING_KEYS.lowStockThreshold, 5);
}

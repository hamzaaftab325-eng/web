import { NextResponse } from "next/server";

import { db } from "@/lib/db";

// Cache for 60 seconds to avoid DB hits on every page load
let cached: { data: Record<string, string>; ts: number } | null = null;
const CACHE_TTL = 60 * 1000; // 60 seconds

/**
 * GET /api/settings — public endpoint returning store settings.
 * Used by the frontend (Footer, Header, checkout, meta tags) to display
 * the correct store name, currency, social links, etc.
 *
 * This endpoint is NOT admin-protected — it returns only public-facing
 * settings (no secrets like API keys or credentials).
 */
export async function GET() {
  try {
    // Check cache first
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      return NextResponse.json({ settings: cached.data });
    }

    const settings = await db.setting.findMany();
    const dbSettings: Record<string, string> = {};
    for (const s of settings) dbSettings[s.key] = s.value;

    // Merge with defaults — only return PUBLIC settings (no secrets)
    const defaults: Record<string, string> = {
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

    const result = { ...defaults, ...dbSettings };

    // Cache it
    cached = { data: result, ts: Date.now() };

    return NextResponse.json({ settings: result });
  } catch {
    // If DB fails, return defaults so the site doesn't break
    return NextResponse.json({
      settings: {
        storeName: "Aura Living",
        storeEmail: "hello@auraliving.com",
        currency: "PKR",
        currencySymbol: "₨",
        taxRate: "0",
        freeShippingThreshold: "10000",
        defaultShippingCost: "150",
        paymentCOD: "true",
        paymentJazzCash: "false",
        paymentEasyPaisa: "false",
        paymentBankTransfer: "false",
      },
    });
  }
}

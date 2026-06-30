import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";

/**
 * GET /api/admin/settings — returns all settings as a key-value object.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const settings = await db.setting.findMany();
  const result: Record<string, string> = {};
  for (const s of settings) result[s.key] = s.value;

  // Provide defaults if not set
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
    emailProvider: "resend",
    emailFrom: "onboarding@resend.dev",
    emailEnabled: "false",
    metaHomeTitle: "Aura Living — Considered Home",
    metaHomeDescription: "Premium home décor atelier offering lamps, mirrors, indoor plants, planters, and sculptural objects. Warm minimalism, artisanal craft.",
    metaShopTitle: "Shop — Aura Living",
    metaShopDescription: "Browse our collection of handcrafted lamps, mirrors, planters, ceramics, and accessories.",
  };

  return NextResponse.json({ settings: { ...defaults, ...result } });
}

const UpdateSchema = z.object({
  settings: z.record(z.string(), z.string()),
});

/**
 * PUT /api/admin/settings — update multiple settings at once.
 */
export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation failed", code: "VALIDATION_ERROR" }, { status: 400 });

  // Upsert each setting
  for (const [key, value] of Object.entries(parsed.data.settings)) {
    await db.setting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }

  return NextResponse.json({ message: "Settings updated" });
}

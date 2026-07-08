import { NextRequest, NextResponse } from "next/server";

import { z } from "zod";

import { verifyToken } from "@/lib/auth";
import { getAccessToken } from "@/lib/auth-cookies";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const token = getAccessToken(request);
    if (!token) return NextResponse.json({ error: "Not authenticated", code: "UNAUTHORIZED" }, { status: 401 });
    const payload = verifyToken(token);

    const addresses = await db.address.findMany({ where: { userId: payload.userId }, orderBy: { isDefault: "desc" } });
    return NextResponse.json(addresses);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "FETCH_ERROR" }, { status: 500 });
  }
}

const addressSchema = z.object({
  label: z.string().optional(),
  firstName: z.string(), lastName: z.string(), street: z.string(),
  apartment: z.string().optional(), city: z.string(), province: z.string(),
  postalCode: z.string(), phone: z.string(), isDefault: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  try {
    const token = getAccessToken(request);
    if (!token) return NextResponse.json({ error: "Not authenticated", code: "UNAUTHORIZED" }, { status: 401 });
    const payload = verifyToken(token);

    const body = await request.json();
    const parsed = addressSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input", code: "VALIDATION_ERROR" }, { status: 400 });

    // If default, unset others
    if (parsed.data.isDefault) {
      await db.address.updateMany({ where: { userId: payload.userId }, data: { isDefault: false } });
    }

    const address = await db.address.create({
      data: { ...parsed.data, userId: payload.userId, country: "Pakistan" },
    });

    return NextResponse.json({ address, message: "Address saved" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "SAVE_ERROR" }, { status: 500 });
  }
}

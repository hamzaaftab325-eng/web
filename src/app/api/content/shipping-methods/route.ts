import { NextResponse } from "next/server";
import { db } from "@/lib/db";
export async function GET() {
  try {
    const methods = await db.shippingMethod.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } });
    return NextResponse.json(methods.map(m => ({ id: m.id, code: m.code, name: m.name, description: m.description ?? "", baseCost: Number(m.baseCost), freeThreshold: m.freeThreshold ? Number(m.freeThreshold) : null, estimatedDays: m.estimatedDays ?? "" })));
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "FETCH_ERROR" }, { status: 500 }); }
}

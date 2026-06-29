import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const products = await db.product.findMany({ where: { isActive: true }, select: { materials: true } });
    const allMaterials = new Set<string>();
    products.forEach(p => p.materials.forEach(m => allMaterials.add(m)));
    return NextResponse.json(Array.from(allMaterials).sort());
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "FETCH_ERROR" }, { status: 500 });
  }
}

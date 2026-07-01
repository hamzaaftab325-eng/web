import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/content/brand-marquee
 *
 * Public endpoint — returns active brand marquee items for the home page
 * scrolling marquee. Ordered by sortOrder.
 */
export async function GET() {
  try {
    const items = await db.brandMarqueeItem.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, text: true, sortOrder: true },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("[content/brand-marquee] Error:", error);
    // Return fallback data so the marquee always shows something
    return NextResponse.json([
      { id: "fallback-1", text: "Artisan Crafted", sortOrder: 0 },
      { id: "fallback-2", text: "Sustainably Sourced", sortOrder: 1 },
      { id: "fallback-3", text: "Slow Made", sortOrder: 2 },
      { id: "fallback-4", text: "Workshop Traced", sortOrder: 3 },
      { id: "fallback-5", text: "Lifetime Care", sortOrder: 4 },
      { id: "fallback-6", text: "Designed in Lahore", sortOrder: 5 },
    ]);
  }
}

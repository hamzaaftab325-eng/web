import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";

/**
 * GET /api/admin/customers/[id]/orders
 *
 * Fetch all orders for a specific customer (admin only).
 * Used in the customer detail page to show order history.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;

    const orders = await db.order.findMany({
      where: { userId: id },
      include: {
        items: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Transform to match the frontend interface
    const result = orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      total: Number(o.total),
      createdAt: o.createdAt.toISOString(),
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      itemCount: o.items.length,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("[admin/customers/[id]/orders] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch customer orders" },
      { status: 500 }
    );
  }
}

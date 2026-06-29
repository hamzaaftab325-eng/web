import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;

    const orders = await db.order.findMany({ orderBy: { createdAt: "desc" }, include: { items: true }, take: 100 });
    return NextResponse.json({ orders: orders.map(o => ({
      id: o.id, orderNumber: o.orderNumber, date: o.createdAt.toISOString().split("T")[0],
      status: o.status, total: Number(o.total), email: o.email, paymentMethod: o.paymentMethod, paymentStatus: o.paymentStatus,
    })) });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Failed" }, { status: 500 }); }
}

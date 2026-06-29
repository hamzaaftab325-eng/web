import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { getAccessToken } from "@/lib/auth-cookies";

export async function GET(request: NextRequest) {
  try {
    const token = getAccessToken(request);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const payload = verifyToken(token);
    if (payload.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const orders = await db.order.findMany({ orderBy: { createdAt: "desc" }, include: { items: true }, take: 100 });
    return NextResponse.json({ orders: orders.map(o => ({
      id: o.id, orderNumber: o.orderNumber, date: o.createdAt.toISOString().split("T")[0],
      status: o.status, total: Number(o.total), email: o.email, paymentMethod: o.paymentMethod, paymentStatus: o.paymentStatus,
    })) });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Failed" }, { status: 500 }); }
}

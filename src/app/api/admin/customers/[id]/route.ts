import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";

const CustomerUpdateSchema = z.object({
  role: z.enum(["customer", "admin"]).optional(),
  isActive: z.boolean().optional(),
  firstName: z.string().min(1).max(60).optional(),
  lastName: z.string().min(1).max(60).optional(),
  phone: z.string().max(30).nullable().optional(),
});

/**
 * GET /api/admin/customers/[id] — fetch a single customer with orders (admin only).
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, firstName: true, lastName: true, phone: true,
        role: true, isActive: true, createdAt: true,
        orders: { orderBy: { createdAt: "desc" }, take: 20, select: { id: true, orderNumber: true, status: true, total: true, createdAt: true } },
      },
    });
    if (!user) return NextResponse.json({ error: "Not found", code: "NOT_FOUND" }, { status: 404 });

    return NextResponse.json({
      ...user,
      createdAt: user.createdAt.toISOString().split("T")[0],
      orders: user.orders.map(o => ({ ...o, total: Number(o.total), date: o.createdAt.toISOString().split("T")[0] })),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "FETCH_ERROR" }, { status: 500 });
  }
}

/**
 * PUT /api/admin/customers/[id] — update customer role/active status/profile (admin only).
 */
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;

    const { id } = await params;
    const body = await request.json();
    const parsed = CustomerUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation failed", code: "VALIDATION_ERROR" }, { status: 400 });
    }
    const data = parsed.data;

    const updated = await db.user.update({
      where: { id },
      data: {
        ...(data.role !== undefined && { role: data.role }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.firstName !== undefined && { firstName: data.firstName }),
        ...(data.lastName !== undefined && { lastName: data.lastName }),
        ...(data.phone !== undefined && { phone: data.phone }),
      },
      select: { id: true, email: true, firstName: true, lastName: true, phone: true, role: true, isActive: true },
    });

    return NextResponse.json({ customer: updated, message: "Customer updated" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "UPDATE_ERROR" }, { status: 500 });
  }
}

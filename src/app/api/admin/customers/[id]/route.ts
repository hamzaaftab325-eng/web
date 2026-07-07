import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { requireAdmin, invalidateUserCache } from "@/lib/auth-guard";

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
 *
 * Self-lock protection (3 guards):
 * 1. An admin CANNOT change their own `role` or `isActive` — prevents
 *    accidental self-demotion or self-deactivation that would lock them out.
 *    Self-edits to firstName/lastName/phone are still allowed (use /api/auth/me).
 * 2. An admin CANNOT demote or deactivate the LAST active admin — prevents
 *    locking everyone out of the admin panel.
 * 3. The target user must exist (404 if not).
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

    // Guard 1: prevent self-modification of role or isActive
    // (admins can still edit their own name/phone via /api/auth/me)
    const isSelf = auth.id === id;
    const changingRoleOrActive = data.role !== undefined || data.isActive !== undefined;
    if (isSelf && changingRoleOrActive) {
      return NextResponse.json(
        { error: "You cannot change your own role or active status. Ask another admin.", code: "SELF_MODIFICATION_FORBIDDEN" },
        { status: 400 }
      );
    }

    // Fetch target user (must exist)
    const target = await db.user.findUnique({
      where: { id },
      select: { id: true, role: true, isActive: true },
    });
    if (!target) return NextResponse.json({ error: "Not found", code: "NOT_FOUND" }, { status: 404 });

    // Guard 2: prevent demoting/deactivating the last active admin
    const wouldDemote = data.role !== undefined && data.role !== "admin" && target.role === "admin";
    const wouldDeactivate = data.isActive === false && target.isActive;
    if ((wouldDemote || wouldDeactivate) && target.role === "admin" && target.isActive) {
      const activeAdminCount = await db.user.count({
        where: { role: "admin", isActive: true },
      });
      if (activeAdminCount <= 1) {
        return NextResponse.json(
          { error: "Cannot demote or deactivate the last active admin. Promote another user first.", code: "LAST_ADMIN_FORBIDDEN" },
          { status: 400 }
        );
      }
    }

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

    // Invalidate the user cache for this user — without this, the user's stale
    // role/isActive would persist in the in-memory cache for up to 60 seconds,
    // allowing a demoted/deactivated admin to retain access briefly.
    invalidateUserCache(id);

    return NextResponse.json({ customer: updated, message: "Customer updated" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed", code: "UPDATE_ERROR" }, { status: 500 });
  }
}

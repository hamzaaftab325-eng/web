import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";

const BulkSchema = z.object({
  ids: z.array(z.string()).min(1),
  action: z.enum(["activate", "deactivate", "feature", "unfeature", "delete"]),
});

/** POST /api/admin/products/bulk — bulk actions on multiple products */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  const body = await request.json();
  const parsed = BulkSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation failed", code: "VALIDATION_ERROR" }, { status: 400 });

  const { ids, action } = parsed.data;

  switch (action) {
    case "activate":
      await db.product.updateMany({ where: { id: { in: ids } }, data: { isActive: true, inStock: true } });
      return NextResponse.json({ message: `${ids.length} products activated` });
    case "deactivate":
      await db.product.updateMany({ where: { id: { in: ids } }, data: { isActive: false } });
      return NextResponse.json({ message: `${ids.length} products deactivated` });
    case "feature":
      await db.product.updateMany({ where: { id: { in: ids } }, data: { featured: true } });
      return NextResponse.json({ message: `${ids.length} products featured` });
    case "unfeature":
      await db.product.updateMany({ where: { id: { in: ids } }, data: { featured: false } });
      return NextResponse.json({ message: `${ids.length} products unfeatured` });
    case "delete":
      // Soft delete per BACKEND_RULES rule 14
      await db.product.updateMany({ where: { id: { in: ids } }, data: { isActive: false, inStock: false } });
      return NextResponse.json({ message: `${ids.length} products deactivated (soft delete)` });
    default:
      return NextResponse.json({ error: "Unknown action", code: "VALIDATION_ERROR" }, { status: 400 });
  }
}

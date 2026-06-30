import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";

/** GET /api/admin/content/sustainability — list all sections */
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  const items = await db.sustainabilityContent.findMany({ orderBy: { section: "asc" } });
  return NextResponse.json({ sections: items });
}

/** PUT /api/admin/content/sustainability — upsert a section by name */
export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;
  const body = await request.json();
  const section = z.string().min(1).max(50).safeParse(body.section);
  if (!section.success) return NextResponse.json({ error: "Section name required", code: "VALIDATION_ERROR" }, { status: 400 });
  const existing = await db.sustainabilityContent.findFirst({ where: { section: section.data } });
  if (existing) {
    const updated = await db.sustainabilityContent.update({ where: { id: existing.id }, data: { data: body.data, isActive: body.isActive ?? existing.isActive } });
    return NextResponse.json({ section: updated, message: "Sustainability section updated" });
  }
  const created = await db.sustainabilityContent.create({ data: { section: section.data, data: body.data, isActive: body.isActive ?? true } });
  return NextResponse.json({ section: created, message: "Sustainability section created" }, { status: 201 });
}

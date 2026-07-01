import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";

/**
 * POST /api/admin/subscribers/import — import subscribers from CSV text.
 * CSV format: email (one per line, or comma-separated)
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const text = await request.text();
    if (!text.trim()) return NextResponse.json({ error: "No data provided", code: "VALIDATION_ERROR" }, { status: 400 });

    // Parse emails — handle both newline and comma separated
    const emails = text
      .split(/[\n,]/)
      .map(e => e.trim().toLowerCase())
      .filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));

    if (emails.length === 0) return NextResponse.json({ error: "No valid emails found", code: "VALIDATION_ERROR" }, { status: 400 });

    let imported = 0;
    let skipped = 0;

    for (const email of emails) {
      const existing = await db.emailSubscriber.findFirst({ where: { email } });
      if (existing) {
        skipped++;
        continue;
      }
      await db.emailSubscriber.create({ data: { email, source: "import" } });
      imported++;
    }

    return NextResponse.json({
      message: `Import complete: ${imported} added, ${skipped} already existed`,
      imported,
      skipped,
      total: emails.length,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Import failed", code: "IMPORT_ERROR" }, { status: 500 });
  }
}

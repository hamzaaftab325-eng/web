import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";

/**
 * POST /api/admin/products/import — bulk import products from CSV.
 *
 * CSV format (same as export):
 * slug, name, price, compareAtPrice, stockQuantity, inStock, isActive, featured, category, badge, materials, dimensions, image
 *
 * Accepts CSV as plain text in request body.
 */
export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const csv = await request.text();
    if (!csv.trim()) return NextResponse.json({ error: "No CSV data provided", code: "VALIDATION_ERROR" }, { status: 400 });

    const lines = csv.split("\n").filter(l => l.trim());
    if (lines.length < 2) return NextResponse.json({ error: "CSV must have a header row and at least one product", code: "VALIDATION_ERROR" }, { status: 400 });

    // Parse header
    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());

    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => { row[h] = values[idx] ?? ""; });

      if (!row.slug || !row.name || !row.price) {
        skipped++;
        errors.push(`Row ${i + 1}: Missing required fields (slug, name, price)`);
        continue;
      }

      // Check if product already exists
      const existing = await db.product.findUnique({ where: { slug: row.slug } });
      if (existing) {
        skipped++;
        errors.push(`Row ${i + 1}: Product with slug "${row.slug}" already exists`);
        continue;
      }

      // Resolve category
      let categoryId: string | undefined;
      if (row.category) {
        const cat = await db.category.findFirst({ where: { name: { contains: row.category, mode: "insensitive" } } });
        if (cat) categoryId = cat.id;
      }

      await db.product.create({
        data: {
          slug: row.slug,
          name: row.name,
          description: row.description || row.name,
          price: Number(row.price),
          compareAtPrice: row.compareatprice ? Number(row.compareatprice) : null,
          stockQuantity: Number(row.stockquantity) || 0,
          inStock: row.instock !== "false",
          isActive: row.isactive !== "false",
          featured: row.featured === "true",
          categoryId,
          badge: row.badge || null,
          materials: row.materials ? row.materials.split(";").map((m: string) => m.trim()).filter(Boolean) : [],
          dimensions: row.dimensions || null,
          images: row.image ? { create: [{ url: row.image, altText: row.name, sortOrder: 0 }] } : undefined,
        },
      });
      imported++;
    }

    return NextResponse.json({
      message: `Import complete: ${imported} imported, ${skipped} skipped`,
      imported,
      skipped,
      errors: errors.slice(0, 10),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Import failed", code: "IMPORT_ERROR" }, { status: 500 });
  }
}

/** Parse a CSV line, handling quoted values with commas */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

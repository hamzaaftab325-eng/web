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
    const toCreate: Array<{
      slug: string;
      name: string;
      description: string;
      price: number;
      compareAtPrice: number | null;
      stockQuantity: number;
      inStock: boolean;
      isActive: boolean;
      featured: boolean;
      categoryId: string | undefined;
      badge: string | null;
      materials: string[];
      dimensions: string | null;
      imageUrl: string | null;
    }> = [];

    // Phase 1: parse + validate all rows. No DB writes yet — avoid partial
    // imports if any row has bad data.
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

      toCreate.push({
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
        imageUrl: row.image || null,
      });
    }

    // Phase 2: insert all valid rows in a single transaction. If any row
    // fails to insert, the entire batch rolls back — no partial imports.
    if (toCreate.length > 0) {
      await db.$transaction(async (tx) => {
        for (const item of toCreate) {
          await tx.product.create({
            data: {
              slug: item.slug,
              name: item.name,
              description: item.description,
              price: item.price,
              compareAtPrice: item.compareAtPrice,
              stockQuantity: item.stockQuantity,
              inStock: item.inStock,
              isActive: item.isActive,
              featured: item.featured,
              categoryId: item.categoryId,
              badge: item.badge,
              materials: item.materials,
              dimensions: item.dimensions,
              images: item.imageUrl ? { create: [{ url: item.imageUrl, altText: item.name, sortOrder: 0 }] } : undefined,
            },
          });
          imported++;
        }
      });
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

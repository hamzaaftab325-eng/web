/**
 * Clean up stray "Lamps" category (slug: "lamp") and its product.
 * The intended 5 categories are: Lighting, Mirrors, Plants & Planters, Ceramics, Accessories.
 */
import { PrismaClient } from "@prisma/client";

process.env.DATABASE_URL = "postgresql://postgres.stekfrfpwnxsczwjsrtc:Cobalt%21Tree%23981@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1";
process.env.DIRECT_URL = "postgresql://postgres.stekfrfpwnxsczwjsrtc:Cobalt%21Tree%23981@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres";

const db = new PrismaClient();

async function main() {
  console.log("Looking for stray 'Lamps' category...");

  const stray = await db.category.findFirst({
    where: { slug: "lamp" },
    include: { products: true },
  });

  if (!stray) {
    console.log("✓ No stray category found — already clean!");
    return;
  }

  console.log(`Found stray category: ${stray.name} (slug: ${stray.slug})`);
  console.log(`  Products in this category: ${stray.products.length}`);

  // Move products to the "Lighting" category (or delete if they're test products)
  const lighting = await db.category.findFirst({ where: { slug: "lighting" } });

  for (const product of stray.products) {
    if (lighting) {
      console.log(`  Moving product '${product.name}' to Lighting category...`);
      await db.product.update({
        where: { id: product.id },
        data: { categoryId: lighting.id },
      });
    } else {
      console.log(`  Deleting test product '${product.name}'...`);
      await db.product.delete({ where: { id: product.id } });
    }
  }

  // Delete the stray category
  await db.category.delete({ where: { id: stray.id } });
  console.log(`✓ Deleted stray category: ${stray.name}`);

  // Verify final state
  const categories = await db.category.findMany({
    orderBy: { sortOrder: "asc" },
    select: { name: true, slug: true, isActive: true, _count: { select: { products: true } } },
  });
  console.log("\nFinal categories:");
  categories.forEach((c) => {
    console.log(`  ${c.isActive ? "✅" : "❌"} ${c.name} (${c.slug}) — ${c._count.products} products`);
  });
}

main()
  .catch((e) => { console.error("Failed:", e); process.exit(1); })
  .finally(() => db.$disconnect().then(() => process.exit(0)));

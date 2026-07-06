/**
 * Seed a test FlashSale record into the database.
 * Run with: npx tsx scripts/seed-flash-sale.ts
 * Requires DATABASE_URL and DIRECT_URL in .env or .env.local
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Check if a test sale already exists
  const existing = await prisma.flashSale.findFirst({
    where: { name: "Summer Luxe Flash Sale" },
  });
  if (existing) {
    console.log("Test flash sale already exists with ID:", existing.id);
    console.log("Delete it first if you want to re-seed.");
    return;
  }

  const now = new Date();
  const startDate = new Date(now.getTime() - 60 * 60 * 1000); // Started 1 hour ago
  const endDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // Ends in 3 days

  const sale = await prisma.flashSale.create({
    data: {
      name: "Summer Luxe Flash Sale – Up to 25% Off Handcrafted Home Decor",
      description:
        "Discover exclusive savings on our curated collection of artisan-made ceramics, handwoven textiles, and premium lighting fixtures. Each piece tells a story of Pakistani craftsmanship, now available at unbeatable prices for a limited time only. Don't miss your chance to elevate your living space with premium handcrafted decor at up to 25% off.",
      startDate,
      endDate,
      discountPercent: 25,
      promoCode: "LUXE25",
      isActive: true,
    },
  });

  console.log("Flash sale created successfully!");
  console.log("ID:", sale.id);
  console.log("Name:", sale.name);
  console.log("Description:", sale.description);
  console.log("Discount:", sale.discountPercent, "%");
  console.log("Promo Code:", sale.promoCode);
  console.log("Start:", sale.startDate.toISOString());
  console.log("End:", sale.endDate.toISOString());
  console.log("Active:", sale.isActive);
  console.log("\n---");
  console.log("Visit /sale on your site to see the banner.");
  console.log("Or visit /admin/flash-sales to manage it.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
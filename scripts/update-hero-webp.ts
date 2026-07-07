/**
 * Update hero slide image URLs from .png to .webp in the database.
 *
 * Usage:
 *   bun run scripts/update-hero-webp.ts
 *
 * Requires DATABASE_URL + DIRECT_URL environment variables (loaded from .env.local).
 * Never hardcodes credentials.
 */
import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";

config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
  console.error("✗ DATABASE_URL is not set. Add it to .env.local and re-run.");
  process.exit(1);
}

const db = new PrismaClient();

async function main() {
  console.log("Updating hero slide image URLs to WebP...");

  const slides = await db.heroSlide.findMany();
  console.log(`Found ${slides.length} hero slides`);

  for (const slide of slides) {
    if (slide.imageUrl && slide.imageUrl.includes(".png")) {
      const newImage = slide.imageUrl.replace(".png", ".webp");
      await db.heroSlide.update({
        where: { id: slide.id },
        data: { imageUrl: newImage },
      });
      console.log(`  ✓ ${slide.imageUrl} → ${newImage}`);
    }
  }

  console.log("\nDone! Verifying...");
  const updated = await db.heroSlide.findMany({ select: { imageUrl: true, headline: true } });
  updated.forEach((s) => console.log(`  ${s.imageUrl} — ${s.headline?.substring(0, 30)}`));
}

main()
  .catch((e) => { console.error("Failed:", e); process.exit(1); })
  .finally(() => db.$disconnect().then(() => process.exit(0)));

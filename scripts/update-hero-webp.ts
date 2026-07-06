/**
 * Update hero slide image URLs from .png to .webp in the database.
 */
import { PrismaClient } from "@prisma/client";

process.env.DATABASE_URL = "postgresql://postgres.stekfrfpwnxsczwjsrtc:Cobalt%21Tree%23981@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1";
process.env.DIRECT_URL = "postgresql://postgres.stekfrfpwnxsczwjsrtc:Cobalt%21Tree%23981@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres";

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

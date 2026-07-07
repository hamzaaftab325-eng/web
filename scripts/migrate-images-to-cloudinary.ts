/**
 * Migrate product images from Unsplash URLs to Cloudinary.
 *
 * Usage:
 *   bun run scripts/migrate-images-to-cloudinary.ts
 *
 * Requires DATABASE_URL, NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
 * CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET environment variables
 * (loaded from .env.local). Never hardcodes credentials.
 */
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import { config } from "dotenv";

config({ path: ".env.local" });

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

if (!process.env.DATABASE_URL) {
  console.error("✗ DATABASE_URL is not set. Add it to .env.local and re-run.");
  process.exit(1);
}
if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
  console.error("✗ Cloudinary credentials missing. Set these in .env.local:");
  console.error("    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME");
  console.error("    CLOUDINARY_API_KEY");
  console.error("    CLOUDINARY_API_SECRET");
  process.exit(1);
}

const db = new PrismaClient();

async function generateSignature(paramsToSign: string, apiSecret: string): Promise<string> {
  return crypto.createHash("sha1").update(paramsToSign + apiSecret).digest("hex");
}

async function uploadToCloudinary(imageUrl: string, publicId: string): Promise<string> {
  const timestamp = Math.round(Date.now() / 1000);
  const eagerTransformation = "f_webp,q_auto:best,w_1600,h_1600,c_limit";
  const paramsToSign = `eager=${eagerTransformation}&folder=aura-living/products&public_id=${publicId}&timestamp=${timestamp}`;
  const signature = await generateSignature(paramsToSign, API_SECRET);

  const formData = new FormData();
  formData.append("file", imageUrl);
  formData.append("folder", "aura-living/products");
  formData.append("public_id", publicId);
  formData.append("timestamp", String(timestamp));
  formData.append("api_key", API_KEY);
  formData.append("signature", signature);
  formData.append("eager", eagerTransformation);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({})) as { error?: { message?: string } };
    throw new Error(error?.error?.message ?? "Upload failed");
  }

  const result = await response.json() as { secure_url: string };
  return result.secure_url;
}

async function main() {
  console.log("Migrating product images from Unsplash to Cloudinary...\n");

  const images = await db.productImage.findMany({
    where: {
      url: { contains: "unsplash.com" }
    },
    include: {
      product: { select: { slug: true, name: true } }
    },
    orderBy: [{ productId: "asc" }, { sortOrder: "asc" }]
  });

  console.log(`Found ${images.length} Unsplash images to migrate\n`);

  let migrated = 0;
  let failed = 0;

  for (const img of images) {
    const publicId = `${img.product.slug}-${img.sortOrder + 1}`;

    try {
      console.log(`  ↑ ${img.product.name} — image ${img.sortOrder + 1}...`);
      const cloudinaryUrl = await uploadToCloudinary(img.url, publicId);

      await db.productImage.update({
        where: { id: img.id },
        data: { url: cloudinaryUrl }
      });

      console.log(`    ✓ ${cloudinaryUrl.substring(0, 70)}...`);
      migrated++;

      await new Promise((r) => setTimeout(r, 500));
    } catch (error) {
      console.error(`    ✗ Failed: ${error instanceof Error ? error.message : error}`);
      failed++;
    }
  }

  console.log(`\nMigration complete!`);
  console.log(`  Migrated: ${migrated}`);
  console.log(`  Failed: ${failed}`);

  const remaining = await db.productImage.count({
    where: { url: { contains: "unsplash.com" } }
  });
  const total = await db.productImage.count();
  console.log(`  Remaining Unsplash: ${remaining}/${total}`);
}

main()
  .catch((e) => { console.error("Failed:", e); process.exit(1); })
  .finally(() => db.$disconnect().then(() => process.exit(0)));

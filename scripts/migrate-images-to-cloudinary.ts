/**
 * Migrate product images from Unsplash URLs to Cloudinary.
 * 
 * Downloads each Unsplash image URL from the ProductImage table,
 * uploads to Cloudinary, then updates the ProductImage.url field.
 */
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

process.env.DATABASE_URL = "postgresql://postgres.stekfrfpwnxsczwjsrtc:Cobalt%21Tree%23981@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1";
process.env.DIRECT_URL = "postgresql://postgres.stekfrfpwnxsczwjsrtc:Cobalt%21Tree%23981@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres";

const db = new PrismaClient();

const CLOUD_NAME = "diometfe9";
const API_KEY = "557379872884882";
const API_SECRET = "rNr_wVZdo-Vxdu0VvRn-aNty29g";

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
    const error = await response.json().catch(() => ({}));
    throw new Error(error?.error?.message ?? "Upload failed");
  }

  const result = await response.json();
  return result.secure_url as string;
}

async function main() {
  console.log("Migrating product images from Unsplash to Cloudinary...\n");

  // Get all product images that are NOT on Cloudinary
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
      
      // Small delay to avoid rate limiting
      await new Promise((r) => setTimeout(r, 500));
    } catch (error) {
      console.error(`    ✗ Failed: ${error instanceof Error ? error.message : error}`);
      failed++;
    }
  }

  console.log(`\nMigration complete!`);
  console.log(`  Migrated: ${migrated}`);
  console.log(`  Failed: ${failed}`);
  
  // Verify
  const remaining = await db.productImage.count({
    where: { url: { contains: "unsplash.com" } }
  });
  const total = await db.productImage.count();
  console.log(`  Remaining Unsplash: ${remaining}/${total}`);
}

main()
  .catch((e) => { console.error("Failed:", e); process.exit(1); })
  .finally(() => db.$disconnect().then(() => process.exit(0)));

/**
 * Phase 20.3 — Product Variants Seed
 *
 * Adds size/color variants for products that naturally come in multiple
 * options (lamps with multiple glazes, planters in multiple sizes, etc.).
 *
 * Idempotent: skips products that already have variants.
 */
import { db } from "../src/lib/db";

type VariantSeed = {
  productSlug: string;
  variants: { label: string; swatchColor?: string | null; stockQuantity: number; sortOrder: number }[];
};

const VARIANT_SEEDS: VariantSeed[] = [
  {
    productSlug: "halo-ceramic-table-lamp",
    variants: [
      { label: "Matte White", swatchColor: "#F2EDE4", stockQuantity: 6, sortOrder: 0 },
      { label: "Matte Black", swatchColor: "#1C1C1C", stockQuantity: 4, sortOrder: 1 },
      { label: "Terracotta", swatchColor: "#B8623E", stockQuantity: 2, sortOrder: 2 },
    ],
  },
  {
    productSlug: "smoky-glass-wall-sconce",
    variants: [
      { label: "Smoky", swatchColor: "#3A3530", stockQuantity: 4, sortOrder: 0 },
      { label: "Clear", swatchColor: "#E8E4DC", stockQuantity: 2, sortOrder: 1 },
      { label: "Amber", swatchColor: "#B5712A", stockQuantity: 2, sortOrder: 2 },
    ],
  },
  {
    productSlug: "linen-pendant-light",
    variants: [
      { label: "Natural Linen", swatchColor: "#D9CDB6", stockQuantity: 3, sortOrder: 0 },
      { label: "Charcoal Linen", swatchColor: "#3A3A3A", stockQuantity: 3, sortOrder: 1 },
    ],
  },
  {
    productSlug: "round-oak-mirror",
    variants: [
      { label: 'Small · 45cm', swatchColor: null, stockQuantity: 3, sortOrder: 0 },
      { label: 'Medium · 60cm', swatchColor: null, stockQuantity: 3, sortOrder: 1 },
      { label: 'Large · 80cm', swatchColor: null, stockQuantity: 1, sortOrder: 2 },
    ],
  },
  {
    productSlug: "ribbed-terracotta-planter",
    variants: [
      { label: 'Small · 12cm', swatchColor: null, stockQuantity: 8, sortOrder: 0 },
      { label: 'Medium · 15cm', swatchColor: null, stockQuantity: 7, sortOrder: 1 },
      { label: 'Large · 20cm', swatchColor: null, stockQuantity: 5, sortOrder: 2 },
    ],
  },
  {
    productSlug: "matte-ceramic-planter",
    variants: [
      { label: "White", swatchColor: "#F2EDE4", stockQuantity: 6, sortOrder: 0 },
      { label: "Sand", swatchColor: "#C9A988", stockQuantity: 5, sortOrder: 1 },
      { label: "Charcoal", swatchColor: "#2B2B2B", stockQuantity: 4, sortOrder: 2 },
    ],
  },
  {
    productSlug: "fiddle-leaf-fig",
    variants: [
      { label: 'Small · 60cm', swatchColor: null, stockQuantity: 3, sortOrder: 0 },
      { label: 'Medium · 80cm', swatchColor: null, stockQuantity: 3, sortOrder: 1 },
      { label: 'Large · 120cm', swatchColor: null, stockQuantity: 2, sortOrder: 2 },
    ],
  },
  {
    productSlug: "seagrass-basket",
    variants: [
      { label: 'Small · 25cm', swatchColor: null, stockQuantity: 5, sortOrder: 0 },
      { label: 'Medium · 35cm', swatchColor: null, stockQuantity: 4, sortOrder: 1 },
      { label: 'Large · 45cm', swatchColor: null, stockQuantity: 3, sortOrder: 2 },
    ],
  },
  {
    productSlug: "aperture-arched-floor-mirror",
    variants: [
      { label: 'Natural Oak', swatchColor: '#B8956A', stockQuantity: 3, sortOrder: 0 },
      { label: 'Blackened Oak', swatchColor: '#3A3530', stockQuantity: 2, sortOrder: 1 },
    ],
  },
  {
    productSlug: "hand-painted-ceramic-vase",
    variants: [
      { label: "Matte White", swatchColor: '#F2EDE4', stockQuantity: 6, sortOrder: 0 },
      { label: "Sage", swatchColor: '#A8B5A0', stockQuantity: 4, sortOrder: 1 },
      { label: "Blush", swatchColor: '#D8B5A8', stockQuantity: 2, sortOrder: 2 },
    ],
  },
];

async function seedVariants() {
  console.log("Phase 20.3 — Product Variants Seed\n");
  let added = 0;
  let skipped = 0;

  for (const seed of VARIANT_SEEDS) {
    const product = await db.product.findUnique({
      where: { slug: seed.productSlug },
      select: { id: true, name: true },
    });

    if (!product) {
      console.log(`  ⚠ Skipped "${seed.productSlug}" — product not found`);
      skipped++;
      continue;
    }

    const existing = await db.productVariant.count({
      where: { productId: product.id },
    });

    if (existing > 0) {
      console.log(`  ○ ${product.name} — already has ${existing} variants`);
      skipped++;
      continue;
    }

    await db.productVariant.createMany({
      data: seed.variants.map((v) => ({
        productId: product.id,
        label: v.label,
        swatchColor: v.swatchColor ?? null,
        stockQuantity: v.stockQuantity,
        sortOrder: v.sortOrder,
      })),
    });

    console.log(`  ✓ ${product.name} — added ${seed.variants.length} variants`);
    added++;
  }

  const total = await db.productVariant.count();
  console.log(`\nDone. Added variants to ${added} products (${skipped} skipped).`);
  console.log(`Total variants in database: ${total}`);
}

main()
  .catch((e) => { console.error("Seed failed:", e); process.exit(1); })
  .finally(() => db.$disconnect().then(() => process.exit(0)));

async function main() {
  await seedVariants();
}

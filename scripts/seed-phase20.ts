import { db } from "../src/lib/db";

/**
 * Phase 20 — Full Seed Script
 *
 * Adds comprehensive content to the database:
 * - 5 categories
 * - 4 collections
 * - 20 products with images
 * - 5 journal articles
 * - 4 care guides
 * - 3 press features
 * - 6 Instagram posts
 *
 * Idempotent — safe to re-run (skips if data exists).
 */

// Unsplash image URLs (free to use, high-quality home decor photos)
const IMG = {
  // Lighting
  lamp1: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80",
  lamp2: "https://images.unsplash.com/photo-1543198126-c1d2c9d4d6a3?w=800&q=80",
  lamp3: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&q=80",
  lamp4: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80",
  lamp5: "https://images.unsplash.com/photo-1524634126442-357e0eac3c14?w=800&q=80",
  // Mirrors
  mirror1: "https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&q=80",
  mirror2: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&q=80",
  mirror3: "https://images.unsplash.com/photo-1604578762246-41139e6c1d40?w=800&q=80",
  // Planters & Plants
  planter1: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&q=80",
  planter2: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80",
  planter3: "https://images.unsplash.com/photo-1463320726281-696a485928c7?w=800&q=80",
  planter4: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&q=80",
  // Ceramics
  ceramic1: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&q=80",
  ceramic2: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=80",
  ceramic3: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80",
  ceramic4: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=800&q=80",
  // Accessories
  acc1: "https://images.unsplash.com/photo-1592180300912-1aaf5c62e5b3?w=800&q=80",
  acc2: "https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=800&q=80",
  acc3: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80",
  acc4: "https://images.unsplash.com/photo-1582269449482-1d3e4c7f3e2a?w=800&q=80",
  // Journal covers
  journal1: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80",
  journal2: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1200&q=80",
  journal3: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=1200&q=80",
  journal4: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=1200&q=80",
  journal5: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=1200&q=80",
};

async function seedCategories() {
  const count = await db.category.count();
  if (count >= 5) { console.log("  ○ Categories already seeded"); return; }
  console.log("Adding categories...");
  await db.category.createMany({
    data: [
      { name: "Lighting", slug: "lighting", description: "Sculptural table lamps, floor lamps, and sconces — each one casting its own warmth.", sortOrder: 0, isActive: true },
      { name: "Mirrors", slug: "mirrors", description: "Arched, round, and floor mirrors that open a room and catch the light.", sortOrder: 1, isActive: true },
      { name: "Plants & Planters", slug: "plants-planters", description: "Indoor plants in hand-thrown terracotta and ceramic planters.", sortOrder: 2, isActive: true },
      { name: "Ceramics", slug: "ceramics", description: "Vases, bowls, and sculptural objects in matte glazes and natural tones.", sortOrder: 3, isActive: true },
      { name: "Accessories", slug: "accessories", description: "Bookends, candles, trays, and the small notes that finish a room.", sortOrder: 4, isActive: true },
    ],
  });
  console.log("  ✓ Added 5 categories");
}

async function seedCollections() {
  const count = await db.collection.count();
  if (count >= 4) { console.log("  ○ Collections already seeded"); return; }
  console.log("Adding collections...");
  await db.collection.createMany({
    data: [
      { name: "Summer Edit", slug: "summer-edit", description: "Warm-weather pieces for sunlit rooms — light linens, matte ceramics, and brass that catches the afternoon.", sortOrder: 0, isActive: true },
      { name: "Quiet Corners", slug: "quiet-corners", description: "A reading nook, a fiddle leaf, a single linen cushion — the small notes that finish a room.", sortOrder: 1, isActive: true },
      { name: "The Lighting Edit", slug: "lighting-edit", description: "Sculptural table lamps, smoky glass sconces, and linen pendants — each one casting its own warmth.", sortOrder: 2, isActive: true },
      { name: "The Shelf Edit", slug: "shelf-edit", description: "Obsidian bookends, hand-painted ceramics, pressed botanicals, and beeswax tapers.", sortOrder: 3, isActive: true },
    ],
  });
  console.log("  ✓ Added 4 collections");
}

async function seedProducts() {
  const count = await db.product.count();
  if (count >= 20) { console.log("  ○ Products already seeded"); return; }
  console.log("Adding products...");

  const categories = await db.category.findMany();
  const catMap = Object.fromEntries(categories.map(c => [c.slug, c.id]));

  const products = [
    // Lighting (5)
    { name: "Halo Ceramic Table Lamp", slug: "halo-ceramic-table-lamp", subtitle: "Matte glaze, linen shade", description: "A sculptural table lamp with a hand-thrown ceramic base and natural linen shade.", longDescription: "The Halo Ceramic Table Lamp brings warmth to any console or bedside. The matte glaze catches afternoon light beautifully, while the linen shade diffuses a soft, honeyed glow. Each base is hand-thrown, meaning slight variations in the surface — the mark of a real person, not a machine.", price: 8500, compareAtPrice: 10000, categorySlug: "lighting", badge: "Bestseller", materials: ["Ceramic", "Linen"], dimensions: "35cm × 20cm × 20cm", careInstructions: "Wipe with a dry cloth. Avoid water on the ceramic base.", images: [IMG.lamp1, IMG.lamp2], featured: true, stockQuantity: 12, sortOrder: 0 },
    { name: "Aperture Arched Floor Mirror", slug: "aperture-arched-floor-mirror", subtitle: "Solid oak, brass detail", description: "A full-length arched mirror in solid oak with a hand-finished brass detail.", longDescription: "The Aperture Arched Floor Mirror leans quietly against any wall, opening the room and catching the light. The solid oak frame is finished by hand, and the brass detail at the apex adds a quiet note of warmth.", price: 25000, compareAtPrice: 28000, categorySlug: "lighting", badge: "New", materials: ["Oak", "Brass", "Glass"], dimensions: "160cm × 70cm × 4cm", careInstructions: "Wipe frame with a dry cloth. Clean glass with a lint-free cloth and glass cleaner.", images: [IMG.mirror1, IMG.mirror2], featured: true, stockQuantity: 5, sortOrder: 1 },
    { name: "Brass Arc Floor Lamp", slug: "brass-arc-floor-lamp", subtitle: "Solid brass, marble base", description: "A sculptural arc floor lamp in solid brass with a weighted marble base.", longDescription: "The Brass Arc Floor Lamp arcs gracefully over a sofa or reading chair, casting a focused pool of warm light. The solid brass develops a rich patina over time — a piece that ages with you.", price: 32000, categorySlug: "lighting", badge: "Featured", materials: ["Brass", "Marble"], dimensions: "180cm × 40cm × 40cm", careInstructions: "Polish brass with a soft cloth. Avoid abrasive cleaners.", images: [IMG.lamp3, IMG.lamp4], featured: true, stockQuantity: 3, sortOrder: 2 },
    { name: "Smoky Glass Wall Sconce", slug: "smoky-glass-wall-sconce", subtitle: "Hand-blown glass", description: "A wall sconce in hand-blown smoky glass with a brass mount.", longDescription: "The Smoky Glass Wall Sconce casts a warm, diffused light through hand-blown glass. Each shade is unique — the slight imperfections are the mark of the maker.", price: 12000, categorySlug: "lighting", materials: ["Glass", "Brass"], dimensions: "25cm × 15cm × 10cm", careInstructions: "Dust with a dry cloth. Clean glass with a soft, damp cloth.", images: [IMG.lamp5], featured: false, stockQuantity: 8, sortOrder: 3 },
    { name: "Linen Pendant Light", slug: "linen-pendant-light", subtitle: "Hand-sewn linen shade", description: "A pendant light with a hand-sewn linen shade and brass fitting.", longDescription: "The Linen Pendant Light hangs quietly over a dining table or kitchen island, casting a warm, even glow through natural linen. The shade is hand-sewn, with a subtle texture that softens the light.", price: 15000, categorySlug: "lighting", materials: ["Linen", "Brass"], dimensions: "30cm × 30cm × 25cm", careInstructions: "Dust with a dry cloth. Do not wash the linen shade.", images: [IMG.lamp1], featured: false, stockQuantity: 6, sortOrder: 4 },

    // Mirrors (3)
    { name: "Round Oak Mirror", slug: "round-oak-mirror", subtitle: "Solid oak frame", description: "A round wall mirror in solid oak with a natural finish.", longDescription: "The Round Oak Mirror is a quiet, versatile piece that works in any room — entryway, bathroom, or above a dresser. The solid oak frame is finished by hand.", price: 18000, categorySlug: "mirrors", materials: ["Oak", "Glass"], dimensions: "60cm × 60cm × 3cm", careInstructions: "Wipe frame with a dry cloth. Clean glass with glass cleaner.", images: [IMG.mirror2], featured: false, stockQuantity: 7, sortOrder: 0 },
    { name: "Tall Floor Mirror", slug: "tall-floor-mirror", subtitle: "Blackened steel frame", description: "A full-length floor mirror in blackened steel.", longDescription: "The Tall Floor Mirror leans against any wall, opening the room. The blackened steel frame is minimal and architectural — it lets the reflection do the talking.", price: 22000, compareAtPrice: 25000, categorySlug: "mirrors", badge: "Sale", materials: ["Steel", "Glass"], dimensions: "170cm × 65cm × 3cm", careInstructions: "Wipe frame with a dry cloth. Clean glass with glass cleaner.", images: [IMG.mirror3], featured: true, stockQuantity: 4, sortOrder: 1 },
    { name: "Vanity Table Mirror", slug: "vanity-table-mirror", subtitle: "Brass frame, adjustable", description: "An adjustable vanity mirror in solid brass.", longDescription: "The Vanity Table Mirror sits on a dresser or vanity, adjustable to any angle. The solid brass frame develops a warm patina over time.", price: 9500, categorySlug: "mirrors", materials: ["Brass", "Glass"], dimensions: "35cm × 25cm × 15cm", careInstructions: "Polish brass with a soft cloth.", images: [IMG.mirror1], featured: false, stockQuantity: 10, sortOrder: 2 },

    // Plants & Planters (4)
    { name: "Ribbed Terracotta Planter", slug: "ribbed-terracotta-planter", subtitle: "Hand-thrown terracotta", description: "A hand-thrown terracotta planter with a ribbed texture.", longDescription: "The Ribbed Terracotta Planter brings warmth to any sill or shelf. Each piece is hand-thrown, meaning the ribbed texture is slightly different every time — the mark of a real person.", price: 3500, categorySlug: "plants-planters", badge: "Bestseller", materials: ["Terracotta"], dimensions: "15cm × 15cm × 14cm", careInstructions: "Wipe with a damp cloth. Terracotta is porous — use a saucer indoors.", images: [IMG.planter1, IMG.planter2], featured: true, stockQuantity: 20, sortOrder: 0 },
    { name: "Matte Ceramic Planter", slug: "matte-ceramic-planter", subtitle: "Matte glaze, drainage hole", description: "A ceramic planter in a matte glaze with a drainage hole.", longDescription: "The Matte Ceramic Planter is designed for indoor plants — it has a drainage hole and comes with a matching saucer. The matte glaze is soft to the touch.", price: 4500, categorySlug: "plants-planters", materials: ["Ceramic"], dimensions: "18cm × 18cm × 16cm", careInstructions: "Wipe with a damp cloth. dishwasher safe.", images: [IMG.planter3], featured: false, stockQuantity: 15, sortOrder: 1 },
    { name: "Hanging Macrame Planter", slug: "hanging-macrame-planter", subtitle: "Hand-knotted cotton", description: "A hand-knotted macrame plant hanger in natural cotton.", longDescription: "The Hanging Macrame Planter adds a soft, bohemian note to any room. Hand-knotted in natural cotton rope, it holds any 4-6 inch pot.", price: 2500, categorySlug: "plants-planters", materials: ["Cotton"], dimensions: "100cm length", careInstructions: "Hand wash in cold water. Air dry.", images: [IMG.planter4], featured: false, stockQuantity: 25, sortOrder: 2 },
    { name: "Fiddle Leaf Fig", slug: "fiddle-leaf-fig", subtitle: "Indoor plant, 80cm", description: "A mature fiddle leaf fig plant, 80cm tall.", longDescription: "The Fiddle Leaf Fig is the classic indoor tree — sculptural, architectural, and surprisingly easy to care for. This specimen is 80cm tall and comes in a nursery pot.", price: 6500, categorySlug: "plants-planters", badge: "New", materials: ["Live Plant"], dimensions: "80cm height", careInstructions: "Water weekly. Bright, indirect light. Rotate for even growth.", images: [IMG.planter2], featured: true, stockQuantity: 8, sortOrder: 3 },

    // Ceramics (4)
    { name: "Hand-Painted Ceramic Vase", slug: "hand-painted-ceramic-vase", subtitle: "Matte white, hand-painted", description: "A hand-painted ceramic vase in matte white with a subtle pattern.", longDescription: "The Hand-Painted Ceramic Vase is a quiet centerpiece — each one is painted by hand, meaning no two are exactly alike. The matte glaze is soft to the touch.", price: 5500, categorySlug: "ceramics", badge: "Featured", materials: ["Ceramic"], dimensions: "25cm × 12cm × 12cm", careInstructions: "Wipe with a damp cloth. Not waterproof — use as a dry vessel or with a liner.", images: [IMG.ceramic1, IMG.ceramic2], featured: true, stockQuantity: 12, sortOrder: 0 },
    { name: "Sculptural Ceramic Bowl", slug: "sculptural-ceramic-bowl", subtitle: "Organic form, matte glaze", description: "A sculptural ceramic bowl with an organic, asymmetric form.", longDescription: "The Sculptural Ceramic Bowl is more object than vessel — an asymmetric form that sits quietly on a shelf or table. The matte glaze catches the light.", price: 4000, categorySlug: "ceramics", materials: ["Ceramic"], dimensions: "15cm × 15cm × 8cm", careInstructions: "Wipe with a damp cloth. Decorative use only.", images: [IMG.ceramic3], featured: false, stockQuantity: 14, sortOrder: 1 },
    { name: "Terracotta Ribbed Planter Set", slug: "terracotta-ribbed-planter-set", subtitle: "Set of 3, hand-thrown", description: "A set of three hand-thrown terracotta planters in graduated sizes.", longDescription: "The Terracotta Ribbed Planter Set gives you three graduated sizes — perfect for a windowsill or shelf grouping. Each piece is hand-thrown.", price: 7500, compareAtPrice: 9000, categorySlug: "ceramics", badge: "Sale", materials: ["Terracotta"], dimensions: "Small 10cm, Medium 14cm, Large 18cm", careInstructions: "Wipe with a damp cloth. Use saucers indoors.", images: [IMG.ceramic4], featured: false, stockQuantity: 10, sortOrder: 2 },
    { name: "Matte Black Sculptural Lamp", slug: "matte-black-sculptural-lamp", subtitle: "Sculptural base, linen shade", description: "A table lamp with a matte black sculptural base and linen shade.", longDescription: "The Matte Black Sculptural Lamp is a quiet, architectural piece — the sculptural base is cast in ceramic with a matte black glaze, and the linen shade diffuses a warm, even light.", price: 11000, categorySlug: "ceramics", materials: ["Ceramic", "Linen"], dimensions: "40cm × 20cm × 20cm", careInstructions: "Wipe with a dry cloth.", images: [IMG.ceramic1], featured: false, stockQuantity: 6, sortOrder: 3 },

    // Accessories (4)
    { name: "Obsidian Bookends", slug: "obsidian-bookends", subtitle: "Pair, hand-polished", description: "A pair of hand-polished obsidian bookends.", longDescription: "The Obsidian Bookends are heavy, cool, and quiet — each piece is hand-polished to a smooth, matte finish. They hold books with weight and presence.", price: 6500, categorySlug: "accessories", badge: "New", materials: ["Obsidian"], dimensions: "12cm × 8cm × 8cm each", careInstructions: "Wipe with a dry cloth. Avoid dropping — obsidian is brittle.", images: [IMG.acc1], featured: false, stockQuantity: 10, sortOrder: 0 },
    { name: "Beeswax Taper Candles", slug: "beeswax-taper-candles", subtitle: "Set of 4, natural beeswax", description: "A set of four natural beeswax taper candles.", longDescription: "The Beeswax Taper Candles burn clean and slow, with a warm, honeyed light. Hand-dipped in natural beeswax — no paraffin, no scent.", price: 1800, categorySlug: "accessories", materials: ["Beeswax"], dimensions: "25cm × 2cm each", careInstructions: "Keep wick trimmed to 5mm. Never leave unattended.", images: [IMG.acc2], featured: false, stockQuantity: 30, sortOrder: 1 },
    { name: "Seagrass Basket", slug: "seagrass-basket", subtitle: "Hand-woven, natural", description: "A hand-woven seagrass basket with handles.", longDescription: "The Seagrass Basket is a quiet workhorse — use it for blankets, magazines, or planters. Hand-woven from natural seagrass.", price: 3500, categorySlug: "accessories", materials: ["Seagrass"], dimensions: "35cm × 30cm × 30cm", careInstructions: "Wipe with a dry cloth. Keep away from water.", images: [IMG.acc3], featured: false, stockQuantity: 12, sortOrder: 2 },
    { name: "Pressed Botanical Frame", slug: "pressed-botanical-frame", subtitle: "Oak frame, real pressed flowers", description: "An oak frame with real pressed botanicals.", longDescription: "The Pressed Botanical Frame is a quiet piece of nature for a wall or shelf. Each frame contains real pressed flowers and leaves, arranged by hand.", price: 4500, categorySlug: "accessories", materials: ["Oak", "Pressed Flowers", "Glass"], dimensions: "30cm × 40cm × 2cm", careInstructions: "Keep out of direct sunlight to preserve colors. Dust with a dry cloth.", images: [IMG.acc4], featured: false, stockQuantity: 8, sortOrder: 3 },
  ];

  for (const p of products) {
    const existing = await db.product.findUnique({ where: { slug: p.slug } });
    if (existing) continue;

    const product = await db.product.create({
      data: {
        slug: p.slug,
        name: p.name,
        subtitle: p.subtitle,
        description: p.description,
        longDescription: p.longDescription,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        categoryId: catMap[p.categorySlug],
        badge: p.badge ?? null,
        inStock: p.stockQuantity > 0,
        stockQuantity: p.stockQuantity,
        materials: p.materials,
        dimensions: p.dimensions,
        careInstructions: p.careInstructions,
        featured: p.featured ?? false,
        sortOrder: p.sortOrder ?? 0,
        isActive: true,
        images: {
          create: p.images.map((url: string, i: number) => ({ url, altText: `${p.name} — Image ${i + 1}`, sortOrder: i })),
        },
      },
    });

    // Assign to collections (featured products go to "lighting-edit" or "summer-edit")
    if (p.featured) {
      const collection = await db.collection.findUnique({ where: { slug: "summer-edit" } });
      if (collection) {
        await db.productCollection.create({ data: { productId: product.id, collectionId: collection.id } }).catch(() => {});
      }
    }
    if (p.categorySlug === "lighting") {
      const collection = await db.collection.findUnique({ where: { slug: "lighting-edit" } });
      if (collection) {
        await db.productCollection.create({ data: { productId: product.id, collectionId: collection.id } }).catch(() => {});
      }
    }
    if (p.categorySlug === "accessories") {
      const collection = await db.collection.findUnique({ where: { slug: "shelf-edit" } });
      if (collection) {
        await db.productCollection.create({ data: { productId: product.id, collectionId: collection.id } }).catch(() => {});
      }
    }
  }
  console.log(`  ✓ Added ${products.length} products`);
}

async function seedJournal() {
  const count = await db.journalArticle.count();
  if (count >= 5) { console.log("  ○ Journal articles already seeded"); return; }
  console.log("Adding journal articles...");
  await db.journalArticle.createMany({
    data: [
      { title: "The Art of Slow Living", slug: "the-art-of-slow-living", category: "Atelier Stories", excerpt: "Why we source slowly, make deliberately, and design for permanence — not trends.", body: "Slow living is not about doing less. It is about doing things with more intention — choosing objects that earn their place in your home, made by people you could name.\n\nAt Aura Living, we source slowly. We visit workshops. We sit with the makers. We watch how a ceramic base is thrown, how a linen shade is sewn, how a brass frame is finished by hand.\n\nThis is not efficiency. It is the opposite. But the result is objects that feel made — not manufactured — and that carry the quiet warmth of a real person's hands.\n\nIn a world of fast furniture and faster trends, slow living is a quiet act of resistance. It is choosing one good lamp over five mediocre ones. It is keeping a piece for a decade, not a season.\n\nThis is what we mean by considered home.", heroImage: IMG.journal1, author: "Aura Editorial", readTime: 4, isActive: true, publishedAt: new Date(), sortOrder: 0 },
      { title: "Caring for Brass", slug: "caring-for-brass", category: "Care Guides", excerpt: "How to polish, patina, and preserve your brass pieces for decades.", body: "Brass is a living material. It darkens, it patinas, it tells the story of its environment. Some people love the patina — the warm, aged look that brass develops over time. Others prefer the bright, polished finish.\n\nHere is how to care for both.\n\nIf you love the patina: do nothing. Let your brass piece age naturally. Dust it with a dry cloth. The patina will deepen and warm over the years.\n\nIf you prefer polished brass: use a soft cloth and a brass polish like Brasso. Apply a small amount, rub in circular motions, and buff with a clean cloth. Do this every few months to maintain the shine.\n\nAvoid abrasive cleaners, which can scratch the surface. Avoid water — brass and moisture are not friends.\n\nWith care, a brass piece will outlast you. It is one of the few materials that truly improves with age.", heroImage: IMG.journal2, author: "Aura Editorial", readTime: 3, isActive: true, publishedAt: new Date(), sortOrder: 1 },
      { title: "Lighting Your Home for Winter", slug: "lighting-your-home-for-winter", category: "Design Notes", excerpt: "How to layer light for warmth, depth, and that honeyed afternoon glow.", body: "Winter light is different. It is lower, warmer, and more precious. The right lighting can make a cold room feel like a warm embrace.\n\nHere is how we think about winter lighting.\n\nLayer your light. A single overhead light flattens a room. Instead, use three sources: a floor lamp for reading, a table lamp for warmth, and a candle for intimacy.\n\nChoose warm bulbs. Look for 2700K — the color temperature that mimics afternoon sun. Avoid cool white (4000K+), which feels clinical.\n\nUse shades. A bare bulb is harsh. A linen or glass shade diffuses the light, softening it and spreading it evenly.\n\nAdd a candle. Nothing replaces the warmth of a real flame. A beeswax taper on the dinner table, a pillar candle on the console — these are the small notes that finish a room.\n\nIn winter, light is not just functional. It is emotional. It is the difference between a room that feels cold and a room that feels like home.", heroImage: IMG.journal3, author: "Aura Editorial", readTime: 5, isActive: true, publishedAt: new Date(), sortOrder: 2 },
      { title: "Meet Our Artisans", slug: "meet-our-artisans", category: "Atelier Stories", excerpt: "The workshops behind every Aura Living piece — visited by name, known by hand.", body: "Every Aura Living piece comes from a workshop we have visited — a place we know by name, a maker we have sat with.\n\nThis is not a supply chain. It is a relationship.\n\nWe work with four ateliers across Pakistan. Each one specializes in a different material — ceramic, brass, wood, and glass. Each one is a small, family-run workshop where the craft has been passed down for generations.\n\nWe visit every workshop before we work with them. We watch how they work. We ask about their materials, their process, their families. We pay fair prices — not the lowest, but the right one.\n\nWhen you buy an Aura Living piece, you are not buying from a factory. You are buying from a person. A person whose name we know, whose workshop we have visited, whose craft we respect.\n\nThis is what we mean by slow sourcing. This is what we mean by considered home.", heroImage: IMG.journal4, author: "Aura Editorial", readTime: 6, isActive: true, publishedAt: new Date(), sortOrder: 3 },
      { title: "The Plant Edit", slug: "the-plant-edit", category: "Design Notes", excerpt: "Five indoor plants that thrive in low light — and the planters that suit them.", body: "Not every home has floor-to-ceiling windows. But every home can have plants.\n\nHere are five indoor plants that thrive in low light — and the planters that suit them.\n\n1. Fiddle Leaf Fig. The classic. Sculptural, architectural, and surprisingly easy. Bright, indirect light — but it will tolerate lower light. Pair with a Matte Ceramic Planter.\n\n2. Snake Plant. Nearly indestructible. Tolerates low light and infrequent watering. Pair with a Ribbed Terracotta Planter.\n\n3. Pothos. A trailing vine that grows fast and forgives neglect. Low to medium light. Pair with a Hanging Macrame Planter.\n\n4. ZZ Plant. Glossy, waxy leaves. Tolerates low light and drought. Pair with a Matte Ceramic Planter.\n\n5. Monstera. The split-leaf icon. Medium, indirect light. Pair with a Ribbed Terracotta Planter in the large size.\n\nThe right plant in the right planter can transform a room. Start with one. See how it feels. Add another. Let the room grow.", heroImage: IMG.journal5, author: "Aura Editorial", readTime: 4, isActive: true, publishedAt: new Date(), sortOrder: 4 },
    ],
  });
  console.log("  ✓ Added 5 journal articles");
}

async function seedCareGuides() {
  const count = await db.careGuide.count();
  if (count >= 4) { console.log("  ○ Care guides already seeded"); return; }
  console.log("Adding care guides...");
  await db.careGuide.createMany({
    data: [
      { title: "Caring for Brass", slug: "caring-for-brass", material: "Brass", excerpt: "How to polish, patina, and preserve your brass pieces.", body: "Brass is a living material. It darkens, it patinas, it tells the story of its environment.\n\nFor patina: do nothing. Dust with a dry cloth.\n\nFor polished finish: use a soft cloth and brass polish (like Brasso). Rub in circles, buff clean. Every few months.\n\nAvoid: abrasive cleaners, water, prolonged moisture.\n\nWith care, brass improves with age.", sortOrder: 0, isActive: true },
      { title: "Caring for Ceramics", slug: "caring-for-ceramics", material: "Ceramic", excerpt: "Cleaning, chip repair, and preserving your ceramic pieces.", body: "Ceramics are durable but not indestructible. Here is how to care for them.\n\nCleaning: wipe with a damp, soft cloth. Avoid abrasive sponges. Most ceramics are dishwasher safe, but hand-washing is gentler.\n\nChip repair: small chips can be smoothed with fine sandpaper. For larger chips, consider kintsugi — the Japanese art of repairing with gold.\n\nAvoid: sudden temperature changes (can cause cracking), prolonged exposure to water (can damage unglazed surfaces).\n\nDecorative ceramics: if marked 'decorative use only', they are not waterproof. Use as a dry vessel or with a liner.", sortOrder: 1, isActive: true },
      { title: "Caring for Wood", slug: "caring-for-wood", material: "Wood", excerpt: "Oiling, scratch repair, and preserving your wood pieces.", body: "Wood is a natural material that responds to its environment. Here is how to care for it.\n\nDusting: wipe with a dry, soft cloth. Microfiber is ideal.\n\nOiling: for unfinished wood, apply food-safe mineral oil every 3-6 months. Rub in, let soak, buff dry.\n\nScratch repair: minor scratches can be buffed with fine sandpaper (400 grit). For deeper scratches, use a wood filler stick in a matching color.\n\nAvoid: direct sunlight (can fade), prolonged moisture (can warp), harsh chemical cleaners.\n\nWith care, wood develops a rich patina that improves with age.", sortOrder: 2, isActive: true },
      { title: "Caring for Indoor Plants", slug: "caring-for-indoor-plants", material: "Plants", excerpt: "Watering, light, and repotting basics for your indoor plants.", body: "Indoor plants are easier than you think. Here are the basics.\n\nWatering: most indoor plants prefer to dry out between waterings. Stick your finger 2cm into the soil — if it is dry, water. If it is damp, wait.\n\nLight: bright, indirect light is ideal for most plants. South-facing windows are best. Avoid direct sun, which can scorch leaves.\n\nRepotting: repot every 1-2 years, or when roots circle the bottom of the pot. Use a pot one size larger.\n\nSoil: use a well-draining potting mix. Add perlite for drainage.\n\nFertilizing: feed monthly during the growing season (spring/summer) with a balanced, water-soluble fertilizer.\n\nCommon problems: yellow leaves = overwatering. Brown tips = underwatering or low humidity. Dropping leaves = shock or temperature change.", sortOrder: 3, isActive: true },
    ],
  });
  console.log("  ✓ Added 4 care guides");
}

async function seedPressFeatures() {
  const count = await db.pressFeature.count();
  if (count >= 3) { console.log("  ○ Press features already seeded"); return; }
  console.log("Adding press features...");
  await db.pressFeature.createMany({
    data: [
      { publication: "Dawn Images", year: "2025", tagline: "Home & Design", quote: "Aura Living is redefining what considered home means in Pakistan — one hand-thrown ceramic at a time.", author: "Ayesha Malik", authorRole: "Design Editor", featureUrl: "https://images.dawn.com", sortOrder: 0, isActive: true },
      { publication: "Mango Baaz", year: "2025", tagline: "Lifestyle", quote: "The brass pieces from Aura Living develop a patina that tells the story of your home. This is furniture that ages with you.", author: "Bilal Khan", authorRole: "Contributing Writer", featureUrl: "https://mangobaaz.com", sortOrder: 1, isActive: true },
      { publication: "XpatMN", year: "2024", tagline: "Atelier Spotlight", quote: "A quiet act of resistance against fast furniture — Aura Living sources slowly and makes deliberately.", author: "Fatima Riaz", authorRole: "Editor at Large", featureUrl: "https://xpatmn.com", sortOrder: 2, isActive: true },
    ],
  });
  console.log("  ✓ Added 3 press features");
}

async function seedInstagramPosts() {
  const count = await db.instagramPost.count();
  if (count >= 6) { console.log("  ○ Instagram posts already seeded"); return; }
  console.log("Adding Instagram posts...");
  await db.instagramPost.createMany({
    data: [
      { imageUrl: IMG.lamp1, caption: "The Halo Ceramic Table Lamp in afternoon light. Warm minimalism, lived-in elegance.", sortOrder: 0, isActive: true },
      { imageUrl: IMG.mirror1, caption: "The Aperture Arched Floor Mirror — solid oak, brass detail, and a reflection that opens the room.", sortOrder: 1, isActive: true },
      { imageUrl: IMG.planter1, caption: "Ribbed Terracotta Planters, hand-thrown. Each one slightly different — the mark of a real person.", sortOrder: 2, isActive: true },
      { imageUrl: IMG.ceramic1, caption: "Hand-painted ceramic vase. Quiet centerpiece for a considered table.", sortOrder: 3, isActive: true },
      { imageUrl: IMG.lamp3, caption: "The Brass Arc Floor Lamp develops a rich patina over time — a piece that ages with you.", sortOrder: 4, isActive: true },
      { imageUrl: IMG.acc1, caption: "Obsidian bookends, hand-polished. Heavy, cool, and quiet.", sortOrder: 5, isActive: true },
    ],
  });
  console.log("  ✓ Added 6 Instagram posts");
}

async function main() {
  console.log("Phase 20 — Full Seed\n");
  await seedCategories();
  await seedCollections();
  await seedProducts();
  await seedJournal();
  await seedCareGuides();
  await seedPressFeatures();
  await seedInstagramPosts();

  console.log("\nSeed complete! Database counts:");
  console.log("  Categories:", await db.category.count());
  console.log("  Collections:", await db.collection.count());
  console.log("  Products:", await db.product.count());
  console.log("  Journal articles:", await db.journalArticle.count());
  console.log("  Care guides:", await db.careGuide.count());
  console.log("  Press features:", await db.pressFeature.count());
  console.log("  Instagram posts:", await db.instagramPost.count());
  console.log("  Hero slides:", await db.heroSlide.count());
  console.log("  FAQ items:", await db.faqItem.count());
  console.log("  Testimonials:", await db.testimonial.count());
  console.log("  Brand values:", await db.brandValue.count());
  console.log("  Promo codes:", await db.promoCode.count());
  console.log("  Shipping methods:", await db.shippingMethod.count());
}

main()
  .catch((e) => { console.error("Seed failed:", e); process.exit(1); })
  .finally(() => db.$disconnect().then(() => process.exit(0)));

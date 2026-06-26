import type { Product } from "@/types";

/**
 * Aura Living — Product Catalog (24 SKUs across 6 categories)
 * Imagery: Unsplash CDN with stable photo IDs.
 */

const img = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=900&h=1125&fit=crop&q=80`;

export const products: Product[] = [
  // ─────────────────────────────────────────────────────────────────
  // LAMPS & LIGHTING (5)
  // ─────────────────────────────────────────────────────────────────
  {
    id: "lamp-ceramic-table",
    slug: "ceramic-table-lamp",
    name: "Halo Ceramic Table Lamp",
    subtitle: "Warm Beige",
    description:
      "A hand-thrown stoneware body finished in a matte warm-beige glaze, paired with a linen drum shade. Casts a soft, ambient pool of light on a console or bedside.",
    longDescription:
      "The Halo lamp begins as a single column of stoneware, thrown on the wheel by a ceramics studio in northern Portugal. Each body carries the gentle asymmetry of the hand — a fingerprint of the maker, never two alike. After a slow biscuit fire, the lamp is dipped in a matte glaze tinted with iron oxide to achieve its sun-warmed tone. A natural linen drum shade softens the bulb to a honeyed glow. Use it on a console, a writing desk, or as a pair on long nightstands; it reads equally well in daylight and after dark.",
    price: 189,
    category: "lamps-lighting",
    images: [
      img("1507473885765-e6ed057f782c"),
      img("1513506003901-1e6a229e2d15"),
      img("1565814329452-e1efa11c5b89"),
      img("1517991104123-1d56a6e81ed9"),
    ],
    badge: "Bestseller",
    inStock: true,
    variants: [
      { id: "v-beige", label: "Warm Beige", swatch: "#cdb89a" },
      { id: "v-clay", label: "Terracotta", swatch: "#b8714f" },
      { id: "v-stone", label: "Stone Grey", swatch: "#a8a39c" },
    ],
    materials: ["Stoneware", "Linen", "Brass switch"],
    dimensions: "Ø 28 × H 46 cm",
    careInstructions:
      "Wipe the ceramic body with a dry, soft cloth. Spot-clean the linen shade with a damp cloth; do not saturate. Use a 40W max E27 bulb (warm white recommended).",
    collections: ["warm-tones"],
    featured: true,
  },
  {
    id: "lamp-brass-arc",
    slug: "brass-arc-floor-lamp",
    name: "Crescent Brass Arc Floor Lamp",
    subtitle: "Antique Brass",
    description:
      "A sweeping arc of solid brass anchored by a marble base — an architectural reading lamp that disappears over a sofa or armchair.",
    longDescription:
      "The Crescent arc lamp traces a single, confident curve from a Carrara marble plinth to a pivoting brass head. The brass is antiqued by hand — a slow oxidation that deepens to a burnished ochre, sealed to prevent further tarnish. The marble base is weighted to balance the cantilevered arm, so the lamp reads as a slender line from across the room yet stays perfectly stable. Pivot the head to direct light over a book, or lift it to wash a wall in warm illumination.",
    price: 425,
    category: "lamps-lighting",
    images: [
      img("1517991104123-1d56a6e81ed9"),
      img("1565814329452-e1efa11c5b89"),
      img("1507473885765-e6ed057f782c"),
      img("1513506003901-1e6a229e2d15"),
    ],
    badge: "New",
    inStock: true,
    variants: [
      { id: "v-brass", label: "Antique Brass", swatch: "#9c7c3a" },
      { id: "v-black", label: "Matte Black", swatch: "#1a1a1a" },
    ],
    materials: ["Solid brass", "Carrara marble", "Linen-wrapped cord"],
    dimensions: "Base Ø 30 cm · Arm reach 145 cm · H 195 cm",
    careInstructions:
      "Dust brass with a soft, dry cloth. Avoid brass polish — the antique finish is intentional and sealed. Wipe marble with a damp cloth and dry immediately.",
    collections: ["warm-tones"],
    featured: true,
  },
  {
    id: "lamp-linen-pendant",
    slug: "linen-pendant-light",
    name: "Drift Linen Pendant Light",
    subtitle: "Natural Linen",
    description:
      "A drum-shaped pendant sewn from natural linen, casting a diffused, gallery-soft light over dining tables and entryways.",
    longDescription:
      "The Drift pendant is sewn from a single length of unbleached Belgian linen, stretched over a subtle aluminum frame. When lit, the linen glows like a paper lantern — a soft, gallery-grade diffusion that flatters food, faces, and surfaces alike. The drum shape reads as a quiet line in daylight and a warm halo after dark. Includes a 1.5m black braided cord and a brushed brass canopy.",
    price: 265,
    category: "lamps-lighting",
    images: [
      img("1513506003901-1e6a229e2d15"),
      img("1565814329452-e1efa11c5b89"),
      img("1507473885765-e6ed057f782c"),
      img("1517991104123-1d56a6e81ed9"),
    ],
    inStock: true,
    variants: [
      { id: "v-linen", label: "Natural Linen", swatch: "#d8c9a7" },
      { id: "v-ivory", label: "Ivory Linen", swatch: "#efe7d3" },
    ],
    materials: ["Belgian linen", "Aluminum frame", "Brass canopy"],
    dimensions: "Ø 45 × H 28 cm · Cord 150 cm",
    careInstructions:
      "Vacuum the shade gently with a brush attachment to remove dust. Spot-clean only — do not machine wash.",
    collections: ["warm-tones"],
    featured: true,
  },
  {
    id: "lamp-sculptural-desk",
    slug: "sculptural-desk-lamp",
    name: "Obelisk Sculptural Desk Lamp",
    subtitle: "Matte Black",
    description:
      "A minimal obelisk in matte-black powder-coated steel, with a single pivoting LED head for focused task light.",
    longDescription:
      "The Obelisk desk lamp reduces the form to its essentials — a tapered column and a single horizontal bar that pivots to direct light. The body is powder-coated in a soft-touch matte black that resists fingerprints and reads as a quiet sculpture in daylight. An integrated LED delivers 700 lumens of warm-white light (2700K, CRI 95+) with a stepless dimmer hidden in the base. Ideal for a writing desk, a console, or a bedside reading light.",
    price: 155,
    category: "lamps-lighting",
    images: [
      img("1565814329452-e1efa11c5b89"),
      img("1517991104123-1d56a6e81ed9"),
      img("1507473885765-e6ed057f782c"),
      img("1513506003901-1e6a229e2d15"),
    ],
    inStock: true,
    variants: [
      { id: "v-black", label: "Matte Black", swatch: "#1a1a1a" },
      { id: "v-putty", label: "Warm Putty", swatch: "#b8a892" },
    ],
    materials: ["Powder-coated steel", "Integrated LED"],
    dimensions: "Base 18 × 12 cm · H 42 cm",
    careInstructions:
      "Dust with a dry microfiber cloth. The LED module is rated for 25,000 hours and is not user-replaceable.",
    collections: [],
    featured: false,
  },
  {
    id: "lamp-glass-sconce",
    slug: "glass-globe-wall-sconce",
    name: "Meridian Glass Globe Wall Sconce",
    subtitle: "Smoked Glass",
    description:
      "A smoked-glass globe on a slim brass arm — a quiet wall light for hallways, reading nooks, and bedside walls.",
    longDescription:
      "The Meridian sconce pairs a hand-blown smoked-glass globe with a slender brass arm. The brass is finished in a soft antique patina that complements the warm tint of the glass. The globe diffuses the bulb so the light reads as a soft halo on the wall rather than a hard point. Mount singly beside a mirror, in pairs flanking a bed, or as a row down a long hallway.",
    price: 145,
    compareAtPrice: 175,
    category: "lamps-lighting",
    images: [
      img("1517991104123-1d56a6e81ed9"),
      img("1507473885765-e6ed057f782c"),
      img("1565814329452-e1efa11c5b89"),
      img("1513506003901-1e6a229e2d15"),
    ],
    badge: "Sale",
    inStock: true,
    materials: ["Hand-blown smoked glass", "Antique brass"],
    dimensions: "H 22 × W 12 × D 18 cm",
    careInstructions:
      "Allow the glass to cool before cleaning. Wipe with a soft, dry cloth. Brass will develop a natural patina over time.",
    collections: ["warm-tones", "gift-guide-under-150"],
    featured: false,
  },

  // ─────────────────────────────────────────────────────────────────
  // MIRRORS (4)
  // ─────────────────────────────────────────────────────────────────
  {
    id: "mirror-arched-floor",
    slug: "arched-floor-mirror",
    name: "Aperture Arched Floor Mirror",
    subtitle: "Natural Oak Frame",
    description:
      "A full-height arched mirror in a solid oak frame, leaning with quiet authority against a bedroom or entryway wall.",
    longDescription:
      "The Aperture mirror is built around a 4mm silver-backed glass and a frame of solid white oak, finished with a hard-wax oil that deepens the grain without darkening it. The arch softens the line of any wall it leans against; the generous 175cm height lets you see yourself head to toe with room to spare. The frame is rebated around the glass so the mirror appears to float inside the oak. Ships with a French cleat for wall-mounting, or lean it where you like.",
    price: 395,
    category: "mirrors",
    images: [
      img("1618220179428-22790b461013"),
      img("1618221195711-dd6afb41a81b"),
      img("1595428774223-ef52624120d2"),
      img("1582461545998-0a1dcdc62820"),
    ],
    badge: "Bestseller",
    inStock: true,
    variants: [
      { id: "v-oak", label: "Natural Oak", swatch: "#c9a978" },
      { id: "v-walnut", label: "American Walnut", swatch: "#6b4a2d" },
    ],
    materials: ["Solid white oak", "Hard-wax oil finish", "Silver-backed glass"],
    dimensions: "W 80 × H 175 cm",
    careInstructions:
      "Dust the frame with a soft, dry cloth. Clean glass with a streak-free glass cleaner applied to the cloth, not the surface.",
    collections: ["warm-tones"],
    featured: true,
  },
  {
    id: "mirror-round-vintage",
    slug: "round-vintage-mirror",
    name: "Halo Round Vintage Mirror",
    subtitle: "Antique Gold",
    description:
      "A round mirror with a slim antique-gold leaf frame — an understated note above a console or vanity.",
    longDescription:
      "The Halo round mirror is finished by hand with gold leaf applied over a bole base, then gently distressed to reveal the warm red beneath. The frame is just 18mm deep — slim enough to read as a thin line on the wall, present enough to introduce a quiet warmth. The glass is beveled to catch light at the edge. Hang it above a console, in an entryway, or in a pair with a wall sconce between.",
    price: 225,
    category: "mirrors",
    images: [
      img("1618221195711-dd6afb41a81b"),
      img("1618220179428-22790b461013"),
      img("1595428774223-ef52624120d2"),
      img("1582461545998-0a1dcdc62820"),
    ],
    inStock: true,
    variants: [
      { id: "v-gold", label: "Antique Gold", swatch: "#b8923a" },
      { id: "v-silver", label: "Aged Silver", swatch: "#9d9d9d" },
    ],
    materials: ["Wood frame", "Gold leaf", "Beveled glass"],
    dimensions: "Ø 60 × D 5 cm",
    careInstructions:
      "Dust with a soft cloth. Avoid metal polishes — the leaf is delicate and the patina is intentional.",
    collections: ["warm-tones"],
    featured: false,
  },
  {
    id: "mirror-organic",
    slug: "irregular-organic-mirror",
    name: "Pebble Irregular Organic Mirror",
    subtitle: "Raw Brass",
    description:
      "A hand-formed pebble-shaped mirror with a raw-brass rim — an organic, sculptural note for an empty wall.",
    longDescription:
      "The Pebble mirror is shaped freehand from a single sheet of brass, so no two are exactly alike. The rim is left raw — it will patina slowly over years, deepening to a warm ochre. The mirror glass is cut to follow the brass outline, with a slim bevel that catches the light. Hang it where you want an unexpected note: above a low dresser, between two windows, or in a series down a hallway.",
    price: 285,
    category: "mirrors",
    images: [
      img("1595428774223-ef52624120d2"),
      img("1618220179428-22790b461013"),
      img("1618221195711-dd6afb41a81b"),
      img("1582461545998-0a1dcdc62820"),
    ],
    badge: "New",
    inStock: true,
    materials: ["Raw brass rim", "Beveled mirror glass"],
    dimensions: "Approx. 70 × 60 cm (varies)",
    careInstructions:
      "The raw brass will develop a natural patina. To restore the original tone, polish with a brass cleaner and a soft cloth.",
    collections: [],
    featured: true,
  },
  {
    id: "mirror-square-grid",
    slug: "square-grid-mirror",
    name: "Grid Square Mirror",
    subtitle: "Black Metal Frame",
    description:
      "A grid-mirrored panel divided by a slim black metal frame — architectural, modular, gallery-leaning.",
    longDescription:
      "The Grid mirror is built from four beveled mirror panels set into a powder-coated steel frame. The cross bars read as architectural drawings on the wall — a quiet geometry that adds depth without competing with what it reflects. Hang it horizontally above a sideboard, or vertically in an entryway. The frame is welded at the corners and ground smooth, then finished in a low-sheen matte black.",
    price: 175,
    category: "mirrors",
    images: [
      img("1582461545998-0a1dcdc62820"),
      img("1618220179428-22790b461013"),
      img("1595428774223-ef52624120d2"),
      img("1618221195711-dd6afb41a81b"),
    ],
    inStock: false,
    badge: "Sold Out",
    materials: ["Powder-coated steel", "Beveled mirror panels"],
    dimensions: "W 70 × H 100 × D 4 cm",
    careInstructions:
      "Dust the frame with a dry cloth. Clean the glass with a streak-free glass cleaner applied to the cloth.",
    collections: [],
    featured: false,
  },

  // ─────────────────────────────────────────────────────────────────
  // INDOOR PLANTS (4)
  // ─────────────────────────────────────────────────────────────────
  {
    id: "plant-fiddle-leaf",
    slug: "fiddle-leaf-fig",
    name: "Fiddle Leaf Fig",
    subtitle: "In nursery pot · 120cm",
    description:
      "A mature Ficus lyrata with sculptural violin-shaped leaves — a living architectural accent for a bright corner.",
    longDescription:
      "Our Fiddle Leaf Figs are greenhouse-grown to a mature 120cm height, with a single upright trunk and a head of large, glossy violin-shaped leaves. They prefer a bright, indirect-light position and a weekly watering schedule. Ships in a standard nursery pot, ready to drop into any of our planters. Each plant is hand-selected at the greenhouse for shape and health.",
    price: 65,
    category: "indoor-plants",
    images: [
      img("1485955900006-10f4d324d411"),
      img("1463320726281-696a485928c7"),
      img("1466692476868-aef1dfb1e735"),
      img("1459411552884-841db9b3cc2a"),
    ],
    badge: "Bestseller",
    inStock: true,
    materials: ["Living plant", "Plastic nursery pot"],
    dimensions: "H ~120cm · Ø 24cm pot",
    careInstructions:
      "Place in bright, indirect light — within 1-2m of an east- or south-facing window. Water when the top 3cm of soil feels dry (about once a week). Wipe leaves monthly with a damp cloth to keep pores clear.",
    collections: ["the-plant-edit"],
    featured: true,
  },
  {
    id: "plant-monstera",
    slug: "monstera-deliciosa",
    name: "Monstera Deliciosa",
    subtitle: "In nursery pot · 90cm",
    description:
      "The classic Swiss Cheese plant — broad split leaves and a sprawling, jungle-soft habit.",
    longDescription:
      "Monstera deliciosa is the houseplant that needs no introduction — broad, glossy green leaves that develop their iconic splits and holes as the plant matures. Our specimens are 90cm tall, with 3-5 leaves already fenestrated. They tolerate a wide range of light conditions (bright indirect is ideal) and forgive the occasional missed watering. A graceful, easy centerpiece for a living room.",
    price: 55,
    category: "indoor-plants",
    images: [
      img("1463320726281-696a485928c7"),
      img("1485955900006-10f4d324d411"),
      img("1466692476868-aef1dfb1e735"),
      img("1459411552884-841db9b3cc2a"),
    ],
    inStock: true,
    materials: ["Living plant", "Plastic nursery pot"],
    dimensions: "H ~90cm · Ø 21cm pot",
    careInstructions:
      "Tolerates medium to bright indirect light. Water when the top 5cm of soil feels dry — about every 7-10 days. Mist weekly for humidity.",
    collections: ["the-plant-edit"],
    featured: false,
  },
  {
    id: "plant-snake",
    slug: "snake-plant-sansevieria",
    name: "Snake Plant (Sansevieria)",
    subtitle: "In nursery pot · 60cm",
    description:
      "An architectural Sansevieria with upright sword leaves — the most forgiving plant we sell.",
    longDescription:
      "The Snake Plant is the closest thing to an indestructible houseplant. Its upright, sword-shaped leaves rise from a tight rosette and tolerate low light, irregular watering, and dry air with grace. Our 60cm specimens are dense and well-established, ready to live for years on a low-light floor or a bright windowsill alike. An excellent choice for bedrooms — Sansevieria is one of the few plants that releases oxygen at night.",
    price: 40,
    category: "indoor-plants",
    images: [
      img("1466692476868-aef1dfb1e735"),
      img("1485955900006-10f4d324d411"),
      img("1463320726281-696a485928c7"),
      img("1459411552884-841db9b3cc2a"),
    ],
    inStock: true,
    materials: ["Living plant", "Plastic nursery pot"],
    dimensions: "H ~60cm · Ø 17cm pot",
    careInstructions:
      "Tolerates low to bright indirect light. Water only when soil is fully dry — every 2-3 weeks. Overwatering is the only common mistake.",
    collections: ["the-plant-edit", "gift-guide-under-150"],
    featured: false,
  },
  {
    id: "plant-pothos",
    slug: "pothos-hanging",
    name: "Pothos in Hanging Planter",
    subtitle: "Trailing · 30cm + hanger",
    description:
      "A trailing golden pothos in a ready-to-hang macramé hanger — soft green cascades for a window or corner.",
    longDescription:
      "Our Pothos hanging set pairs a 30cm golden pothos — already trailing — with a hand-knotted natural cotton macramé hanger. The plant tolerates low to bright indirect light and grows quickly, sending long cascades of variegated green down the hanger. Includes a waterproof nursery pot nested inside a decorative cachepot, so watering is mess-free. Ready to hang from any ceiling hook.",
    price: 48,
    category: "indoor-plants",
    images: [
      img("1459411552884-841db9b3cc2a"),
      img("1485955900006-10f4d324d411"),
      img("1463320726281-696a485928c7"),
      img("1466692476868-aef1dfb1e735"),
    ],
    badge: "New",
    inStock: true,
    materials: ["Living plant", "Cotton macramé hanger", "Cachepot"],
    dimensions: "Plant H ~30cm · Hanger extended ~90cm",
    careInstructions:
      "Bright indirect light to low light. Water when the top 5cm of soil is dry. Trim vines to encourage bushier growth.",
    collections: ["the-plant-edit", "gift-guide-under-150"],
    featured: false,
  },

  // ─────────────────────────────────────────────────────────────────
  // PLANTERS & POTS (4)
  // ─────────────────────────────────────────────────────────────────
  {
    id: "planter-teracotta-ribbed",
    slug: "terracotta-ribbed-planter",
    name: "Ribbed Terracotta Planter",
    subtitle: "Terracotta · Medium",
    description:
      "A wheel-thrown terracotta planter with hand-cut vertical ribs — warm, breathable, and quietly textural.",
    longDescription:
      "These terracotta planters are thrown by hand on the wheel at a small workshop in Tuscany, then hand-cut with vertical ribs that catch the light and shadow as the sun moves. Terracotta is a breathable clay — it lets the soil dry between waterings, which most plants prefer. The interior is unglazed; the exterior is finished with a matte sealer that protects the surface without losing the raw clay texture. Drainage hole included; saucer sold separately.",
    price: 45,
    category: "planters-pots",
    images: [
      img("1485955900006-10f4d324d411"),
      img("1463320726281-696a485928c7"),
      img("1466692476868-aef1dfb1e735"),
      img("1459411552884-841db9b3cc2a"),
    ],
    inStock: true,
    variants: [
      { id: "v-terracotta", label: "Terracotta", swatch: "#b8714f" },
      { id: "v-white-wash", label: "White Wash", swatch: "#e8dccb" },
    ],
    materials: ["Wheel-thrown terracotta", "Matte sealer"],
    dimensions: "Ø 22 × H 20 cm",
    careInstructions:
      "Wipe with a damp cloth. Terracotta is naturally porous — empty the saucer after watering to prevent mineral buildup.",
    collections: ["the-plant-edit", "warm-tones", "gift-guide-under-150"],
    featured: true,
  },
  {
    id: "planter-concrete-geo",
    slug: "concrete-geometric-planter",
    name: "Geometric Concrete Planter",
    subtitle: "Charcoal Concrete",
    description:
      "A faceted concrete planter cast from a hand-carved mold — heavy, architectural, and quietly modern.",
    longDescription:
      "The Geometric planter is cast in small batches from a high-strength concrete mix, hand-pigmented to a soft charcoal. Each planter is sealed inside and out to resist water staining, and weighted to feel substantial without being unwieldy. The faceted silhouette reads as a small piece of architecture — set it on a desk, a sideboard, or a shelf where its geometry can be appreciated. Drainage hole and rubber feet included.",
    price: 58,
    category: "planters-pots",
    images: [
      img("1463320726281-696a485928c7"),
      img("1485955900006-10f4d324d411"),
      img("1466692476868-aef1dfb1e735"),
      img("1459411552884-841db9b3cc2a"),
    ],
    inStock: true,
    variants: [
      { id: "v-charcoal", label: "Charcoal", swatch: "#3a3a3a" },
      { id: "v-bone", label: "Bone White", swatch: "#e8e2d6" },
    ],
    materials: ["Cast concrete", "Matte sealer"],
    dimensions: "W 18 × D 18 × H 20 cm",
    careInstructions:
      "Wipe with a damp cloth. Re-seal annually with a stone sealer for water resistance.",
    collections: ["the-plant-edit"],
    featured: false,
  },
  {
    id: "planter-handpainted-ceramic",
    slug: "hand-painted-ceramic-pot",
    name: "Hand-Painted Ceramic Pot",
    subtitle: "Blue & White",
    description:
      "A hand-painted ceramic pot decorated with a cobalt brushwork motif — a quiet, painterly note.",
    longDescription:
      "Each pot is thrown in white stoneware, then hand-painted with a cobalt-blue motif before a final clear glaze firing. The brushwork is intentionally loose — the painter responds to the curve of each pot, so no two are identical. Use it as a cachepot for a small plant (no drainage hole), a vessel for dried botanicals, or simply as an object on a shelf. The interior is fully glazed.",
    price: 75,
    category: "planters-pots",
    images: [
      img("1466692476868-aef1dfb1e735"),
      img("1485955900006-10f4d324d411"),
      img("1463320726281-696a485928c7"),
      img("1459411552884-841db9b3cc2a"),
    ],
    inStock: true,
    materials: ["White stoneware", "Cobalt underglaze", "Clear glaze"],
    dimensions: "Ø 16 × H 14 cm",
    careInstructions:
      "Wipe with a damp cloth. Use as a cachepot only — no drainage hole. Do not expose to freezing temperatures.",
    collections: ["gift-guide-under-150"],
    featured: false,
  },
  {
    id: "planter-brass-stand",
    slug: "brass-plant-stand-with-pot",
    name: "Brass Plant Stand with Pot",
    subtitle: "Brass & Ceramic",
    description:
      "A slim brass tripod lifting a stoneware pot — a mid-century note that elevates a single plant to sculpture.",
    longDescription:
      "The brass plant stand lifts a 18cm stoneware pot to a seated height, turning a single plant into a small piece of sculpture. The brass tripod is hand-welded and finished in a soft antique tone; the pot is thrown in matte stoneware and fitted with a drainage hole. The stand disassembles flat for shipping. Use it for a trailing plant (pothos, string of pearls) where the height lets the vines cascade, or a single sculptural specimen (snake plant, agave).",
    price: 120,
    category: "planters-pots",
    images: [
      img("1459411552884-841db9b3cc2a"),
      img("1485955900006-10f4d324d411"),
      img("1463320726281-696a485928c7"),
      img("1466692476868-aef1dfb1e735"),
    ],
    inStock: true,
    materials: ["Antique brass", "Stoneware pot"],
    dimensions: "Stand H 65 cm · Pot Ø 18 × H 16 cm",
    careInstructions:
      "Wipe brass with a dry cloth. The pot has a drainage hole — place on a saucer (not included).",
    collections: ["the-plant-edit", "warm-tones"],
    featured: true,
  },

  // ─────────────────────────────────────────────────────────────────
  // DECORATIVE ACCESSORIES (4)
  // ─────────────────────────────────────────────────────────────────
  {
    id: "acc-obsidian-bookends",
    slug: "obsidian-bookends",
    name: "Obsidian Bookends",
    subtitle: "Pair",
    description:
      "A pair of polished obsidian bookends — a dark, polished note to anchor a stack of books on a shelf.",
    longDescription:
      "Each bookend is cut from a single piece of natural black obsidian, then polished to a soft sheen. The natural variation in the stone means each pair is subtly different — some pieces carry tiny inclusions that catch the light. The base is felt-lined to protect shelves and prevent sliding. Sold as a pair; the set weighs 2.4kg, substantial enough to hold a row of large art books upright.",
    price: 85,
    category: "decorative-accessories",
    images: [
      img("1493663284031-b7e3aefcae8e"),
      img("1513519245088-0e12902e5a38"),
      img("1532634922-8fe0b757fb13"),
      img("1513506003901-1e6a229e2d15"),
    ],
    inStock: true,
    materials: ["Natural obsidian", "Felt base"],
    dimensions: "Each: W 10 × D 7 × H 14 cm · Pair 2.4kg",
    careInstructions:
      "Wipe with a soft, dry cloth. Natural stone — handle with care to avoid chips.",
    collections: ["gift-guide-under-150"],
    featured: false,
  },
  {
    id: "acc-seagrass-basket",
    slug: "handwoven-storage-basket",
    name: "Handwoven Seagrass Basket",
    subtitle: "Seagrass · Medium",
    description:
      "A handwoven seagrass basket with leather handles — for throws, firewood, or a quiet catch-all.",
    longDescription:
      "These baskets are hand-woven from seagrass by a cooperative in Bangladesh, then fitted with vegetable-tanned leather handles. The weave is tight enough to hold smaller items (a tablet, a rolled magazine, dry toiletries) but flexible enough to fold slightly when empty. Use it for throws by a sofa, for firewood beside a hearth, or as a catch-all in an entryway. The leather handles soften and darken beautifully with use.",
    price: 55,
    category: "decorative-accessories",
    images: [
      img("1513519245088-0e12902e5a38"),
      img("1493663284031-b7e3aefcae8e"),
      img("1532634922-8fe0b757fb13"),
      img("1513506003901-1e6a229e2d15"),
    ],
    badge: "Bestseller",
    inStock: true,
    variants: [
      { id: "v-natural", label: "Natural Seagrass", swatch: "#cdb891" },
      { id: "v-stripe", label: "Natural + Black Stripe", swatch: "#5a4a3a" },
    ],
    materials: ["Seagrass", "Vegetable-tanned leather"],
    dimensions: "Ø 38 × H 32 cm (incl. handles)",
    careInstructions:
      "Spot-clean with a damp cloth. Avoid prolonged moisture. Re-shape by stuffing with towels if deformed.",
    collections: ["warm-tones", "gift-guide-under-150"],
    featured: false,
  },
  {
    id: "acc-marble-tray",
    slug: "decorative-stone-tray",
    name: "Decorative Marble Tray",
    subtitle: "White Marble",
    description:
      "A polished white marble tray with a low rim — a quiet pedestal for candles, glasses, or a single object.",
    longDescription:
      "Cut from a single slab of Carrara marble, the tray is polished to a soft satin finish and finished with a low, hand-chiseled rim. The natural veining means no two trays are identical; each carries its own grey-blue pattern through the white field. Use it on a coffee table to corral candles and a book, on a vanity for bottles and a glass, or on a console for keys and a small vase. Felt feet protect surfaces.",
    price: 95,
    category: "decorative-accessories",
    images: [
      img("1532634922-8fe0b757fb13"),
      img("1493663284031-b7e3aefcae8e"),
      img("1513519245088-0e12902e5a38"),
      img("1513506003901-1e6a229e2d15"),
    ],
    inStock: true,
    materials: ["Carrara marble", "Felt feet"],
    dimensions: "W 35 × D 22 × H 4 cm",
    careInstructions:
      "Wipe with a damp cloth. Marble is porous — clean spills promptly to avoid staining. Re-seal annually with a stone sealer.",
    collections: ["gift-guide-under-150"],
    featured: false,
  },
  {
    id: "acc-beeswax-tapers",
    slug: "beeswax-taper-candle-set",
    name: "Beeswax Taper Candle Set",
    subtitle: "Ivory · Set of 6",
    description:
      "A set of six hand-dipped beeswax tapers in warm ivory — a slow, clean burn with a faint honey scent.",
    longDescription:
      "These tapers are hand-dipped from 100% pure beeswax, which burns slower and cleaner than paraffin (about 8 hours per candle). The natural ivory color carries a faint honey scent when lit — never overpowering, just a quiet warmth in the room. The base is sized to fit standard 22mm candleholders. Hand-dipped candles have a slightly tapered shape and a soft, organic surface — no two are identical.",
    price: 35,
    category: "decorative-accessories",
    images: [
      img("1513506003901-1e6a229e2d15"),
      img("1493663284031-b7e3aefcae8e"),
      img("1513519245088-0e12902e5a38"),
      img("1532634922-8fe0b757fb13"),
    ],
    inStock: true,
    materials: ["100% beeswax", "Cotton wick"],
    dimensions: "Each: Ø 2.2 × H 25 cm · 8-hour burn time",
    careInstructions:
      "Trim wick to 1cm before each burn. Never leave unattended. Keep away from drafts to prevent drips.",
    collections: ["warm-tones", "gift-guide-under-150"],
    featured: false,
  },

  // ─────────────────────────────────────────────────────────────────
  // WALL ART (3)
  // ─────────────────────────────────────────────────────────────────
  {
    id: "art-abstract-line-print",
    slug: "abstract-line-print",
    name: "Abstract Line Print",
    subtitle: "Framed · A2",
    description:
      "A single-line abstract composition printed on cotton rag, framed in solid oak — quiet, gestural, modern.",
    longDescription:
      "The Abstract Line Print is an original Aura Living composition — a single continuous line that loops and turns to suggest a figure in repose. Printed on a 310gsm cotton rag paper with archival pigment inks, framed behind glass in a solid oak frame. Hang it as a single statement above a low dresser, or in a small salon wall with two or three companion prints. Each print is signed and numbered in an edition of 200.",
    price: 165,
    category: "wall-art",
    images: [
      img("1513519245088-0e12902e5a38"),
      img("1532634922-8fe0b757fb13"),
      img("1493663284031-b7e3aefcae8e"),
      img("1513506003901-1e6a229e2d15"),
    ],
    inStock: true,
    variants: [
      { id: "v-oak", label: "Oak Frame", swatch: "#c9a978" },
      { id: "v-black", label: "Black Frame", swatch: "#1a1a1a" },
    ],
    materials: ["Cotton rag paper", "Archival pigment inks", "Solid oak frame"],
    dimensions: "A2 · 42 × 59.4 cm (framed)",
    careInstructions:
      "Hang out of direct sunlight to prevent fading. Dust frame with a dry cloth. Clean glass with a streak-free cleaner.",
    collections: ["warm-tones"],
    featured: true,
  },
  {
    id: "art-botanical-pressed",
    slug: "botanical-pressed-art",
    name: "Botanical Pressed Art",
    subtitle: "Set of 3 · A3",
    description:
      "Three pressed-botanical compositions in floating glass frames — a quiet, scientific note for a wall.",
    longDescription:
      "Each piece in this set of three is composed of real pressed botanicals — ferns, grasses, and a single stem — laid out on cotton paper and sealed behind glass in a slim floating frame. The botanicals are hand-pressed in our studio over 4-6 weeks, then arranged with an eye to scientific specimen plates. Hang the three in a row for a quiet, museum-like installation. The set is a limited edition; each set is unique.",
    price: 120,
    compareAtPrice: 145,
    category: "wall-art",
    images: [
      img("1532634922-8fe0b757fb13"),
      img("1513519245088-0e12902e5a38"),
      img("1493663284031-b7e3aefcae8e"),
      img("1513506003901-1e6a229e2d15"),
    ],
    badge: "Sale",
    inStock: true,
    materials: ["Pressed botanicals", "Cotton paper", "Glass floating frame"],
    dimensions: "Each: A3 · 29.7 × 42 cm · Set of 3",
    careInstructions:
      "Hang out of direct sunlight — pressed botanicals will fade in UV light. Dust frames with a dry cloth.",
    collections: ["gift-guide-under-150"],
    featured: false,
  },
  {
    id: "art-woven-hanging",
    slug: "woven-wall-hanging",
    name: "Woven Wall Hanging",
    subtitle: "Cotton & Wool",
    description:
      "A hand-woven wall hanging in natural cotton and undyed wool — a soft, tactile note for a blank wall.",
    longDescription:
      "This wall hanging is woven on a tapestry loom from natural cotton warp and undyed wool weft, with a few long fringed sections that fall below the wooden dowel. The palette is restrained — ivory, oat, and a soft warm grey — letting the texture do the work. Each piece is woven by hand in our studio; no two are exactly alike. Hang it above a headboard, on a narrow wall beside a window, or layered over a larger piece of art.",
    price: 195,
    category: "wall-art",
    images: [
      img("1493663284031-b7e3aefcae8e"),
      img("1513519245088-0e12902e5a38"),
      img("1532634922-8fe0b757fb13"),
      img("1513506003901-1e6a229e2d15"),
    ],
    badge: "New",
    inStock: true,
    materials: ["Cotton warp", "Undyed wool weft", "Wooden dowel"],
    dimensions: "W 50 × H 90 cm (incl. fringe)",
    careInstructions:
      "Dust gently with a soft brush. Spot-clean only with cold water. Avoid hanging in humid rooms.",
    collections: ["warm-tones"],
    featured: false,
  },
];

export const productBySlug = (slug: string) =>
  products.find((p) => p.slug === slug);

export const productsByCategory = (slug: string) =>
  products.filter((p) => p.category === slug);

export const featuredProducts = () => products.filter((p) => p.featured);

export const productsByCollection = (slug: string) =>
  products.filter((p) => p.collections?.includes(slug as never));

export const allMaterials = (): string[] => {
  const set = new Set<string>();
  products.forEach((p) => p.materials?.forEach((m) => set.add(m)));
  return Array.from(set).sort();
};

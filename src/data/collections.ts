import type { Collection } from "@/types";

export const collections: Collection[] = [
  {
    slug: "warm-tones",
    name: "Warm Tones",
    description:
      "A curated edit in beige, brass, and terracotta — objects that share a single, sun-warmed palette.",
    heroImage:
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=1600&h=900&fit=crop&q=80",
    productSlugs: [
      "ceramic-table-lamp",
      "brass-arc-floor-lamp",
      "linen-pendant-light",
      "glass-globe-wall-sconce",
      "arched-floor-mirror",
      "round-vintage-mirror",
      "terracotta-ribbed-planter",
      "brass-plant-stand-with-pot",
      "handwoven-storage-basket",
      "beeswax-taper-candle-set",
      "abstract-line-print",
      "woven-wall-hanging",
    ],
  },
  {
    slug: "the-plant-edit",
    name: "The Plant Edit",
    description:
      "Everything a considered indoor garden needs — living specimens, breathable planters, and the stands that lift them to sculpture.",
    heroImage:
      "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=1600&h=900&fit=crop&q=80",
    productSlugs: [
      "fiddle-leaf-fig",
      "monstera-deliciosa",
      "snake-plant-sansevieria",
      "pothos-hanging",
      "terracotta-ribbed-planter",
      "concrete-geometric-planter",
      "brass-plant-stand-with-pot",
    ],
  },
  {
    slug: "gift-guide-under-150",
    name: "Gift Guide Under $150",
    description:
      "A considered selection of smaller objects — candles, planters, mirrors, and ceramics — each under $150.",
    heroImage:
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1600&h=900&fit=crop&q=80",
    productSlugs: [
      "glass-globe-wall-sconce",
      "snake-plant-sansevieria",
      "pothos-hanging",
      "terracotta-ribbed-planter",
      "hand-painted-ceramic-pot",
      "obsidian-bookends",
      "handwoven-storage-basket",
      "decorative-marble-tray",
      "beeswax-taper-candle-set",
      "botanical-pressed-art",
    ],
  },
];

export const collectionBySlug = (slug: string) =>
  collections.find((c) => c.slug === slug);

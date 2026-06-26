import type { Category } from "@/types";

export const categories: Category[] = [
  {
    slug: "lamps-lighting",
    name: "Lamps & Lighting",
    description:
      "Sculptural pendants, table lamps, and sconces that cast a warm, considered glow.",
    heroImage:
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=1200&h=1500&fit=crop&q=80",
    productCount: 5,
  },
  {
    slug: "mirrors",
    name: "Mirrors",
    description:
      "Arched, organic, and architectural mirrors that open a room and catch the light.",
    heroImage:
      "https://images.unsplash.com/photo-1618220179428-22790b461013?w=1200&h=1500&fit=crop&q=80",
    productCount: 4,
  },
  {
    slug: "indoor-plants",
    name: "Indoor Plants",
    description:
      "Living sculpture — easy-care specimens chosen for shape, texture, and air.",
    heroImage:
      "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=1200&h=1500&fit=crop&q=80",
    productCount: 4,
  },
  {
    slug: "planters-pots",
    name: "Planters & Pots",
    description:
      "Terracotta, concrete, and hand-painted vessels that ground greenery in texture.",
    heroImage:
      "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=1200&h=1500&fit=crop&q=80",
    productCount: 4,
  },
  {
    slug: "decorative-accessories",
    name: "Decorative Accessories",
    description:
      "Bookends, baskets, trays, and candles — the small notes that finish a room.",
    heroImage:
      "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=1200&h=1500&fit=crop&q=80",
    productCount: 4,
  },
  {
    slug: "wall-art",
    name: "Wall Art",
    description:
      "Line prints, pressed botanicals, and woven hangings for considered walls.",
    heroImage:
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1200&h=1500&fit=crop&q=80",
    productCount: 3,
  },
];

export const categoryBySlug = (slug: string) =>
  categories.find((c) => c.slug === slug);

/**
 * Aura Living — Artisan workshop profiles.
 *
 * Each profile carries a long-form story (array of paragraphs rendered
 * verbatim by `ArtisansView`) and a gallery of 8 images that combine
 * lifestyle shots from the local /hero set with craft-appropriate
 * Unsplash photography. Imagery URLs are pre-resolved strings so the
 * view never builds URLs inline (zero-inline-style compliance).
 */

export interface Artisan {
  id: string;
  slug: string;
  name: string;
  location: string;
  founded: string;
  craft: string;
  /** Long-form story, one entry per paragraph. Rendered in order. */
  story: string[];
  /** Hero portrait image for index + detail header. */
  image: string;
  /** Workshop gallery — 8 photographs. */
  gallery: string[];
  productSlugs: string[];
}

const u = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=800&h=800&fit=crop&q=80`;

export const artisans: Artisan[] = [
  {
    id: "ar1",
    slug: "ceramica-porto",
    name: "Cermica Porto",
    location: "Porto, Portugal",
    founded: "1978",
    craft: "Wheel-thrown ceramics",
    story: [
      "In a converted stable above Porto, three generations of the Silva family have been throwing stoneware by hand for over four decades. Joo Silva, now in his seventies, still works the wheel every morning before the city wakes. Every piece carries the gentle asymmetry of the hand  never two alike.",
      "The workshop was founded in 1978 by Joo's father, Manuel, who learned the trade from a cousin in nearby Barcelos. What began as a single wheel and a small kiln has grown into a cooperative of seven potters, all of them family or lifelong neighbours. They throw on three wheels built in the 1960s, repaired so many times that only the frames are original.",
      "Aura Living has worked with Cermica Porto since 2021. We visit the workshop twice a year  once in spring for glaze tests, once in autumn for the new collection. Every visit ends the same way: a long lunch of bacalhau and vinho verde at the table behind the kiln, with Manuel's daughter Sofia translating the older generation's stories.",
      "The clay they use is dug from a riverbank forty kilometres east and aged for six months before it touches a wheel. The glazes are mixed in-house from mineral powders  iron oxide for warm beige, cobalt for the rare blue pieces, copper for the green. Nothing is purchased pre-made. Nothing is fired in under fourteen hours.",
      "Every Aura ceramic piece is signed on the underside with the potter's mark  a small, deliberate stamp that records who threw it and when. If you turn over your Halo lamp base, you'll find it. That signature is the point of the whole exercise.",
    ],
    image: "/hero/slide-4.png",
    gallery: [
      "/hero/slide-4.png",
      "/hero/slide-1.png",
      "/hero/about.png",
      "/hero/journal.png",
      u("1507473885765-e6ed057f782c"),
      u("1517991104123-1d56a6e81ed9"),
      u("1565814329452-e1efa11c5b89"),
      u("1513506003901-1e6a229e2d15"),
    ],
    productSlugs: ["ceramic-table-lamp", "hand-painted-ceramic-pot"],
  },
  {
    id: "ar2",
    slug: "officina-brescia",
    name: "Officina Brescia",
    location: "Brescia, Italy",
    founded: "1962",
    craft: "Brass and metalwork",
    story: [
      "The Rossi family has been shaping brass in the same workshop outside Brescia since 1962. Marco Rossi, the third generation, is known across the region for his obsessive standard for patina  he'll reject a piece if the oxidation is even a shade too dark. Every brass piece that leaves the workshop passes through his hands.",
      "The workshop was a gunsmith's forge before the Rossis bought it in 1962. The original anvil still sits in the corner, now used only for the heaviest bar work. The press that bends the Brass Arc Floor Lamp was built in 1962 by Marco's grandfather, repaired with parts from three different decades, and runs on a single three-phase motor that Marco rebuilds himself every two years.",
      "Brass is a living metal  it deepens and warms with time, reacting to air, touch, and light. Officina Brescia works with two alloys: a higher-copper mix for pieces meant to patina (the arc lamp, the plant stand) and a more stable alloy for sealed pieces. Both are sourced from a foundry in Lombardy that recycles industrial scrap.",
      "We commissioned our first piece from Marco in 2020  a single prototype of the arc lamp that took eleven attempts to bend correctly. He kept the first ten in a row by the door, labelled with the date and the failure. When we asked why, he shrugged: So I remember what not to do.",
      "Every brass piece from Officina Brescia carries a small engraving on the base: OB, the year, and the smith's initials. Marco signs his own work MBP. His father, now retired, signs GP. There are perhaps a dozen living hands whose initials appear on Aura brass.",
    ],
    image: "/hero/slide-2.png",
    gallery: [
      "/hero/slide-2.png",
      "/hero/slide-3.png",
      "/hero/lookbook.png",
      "/hero/shop.png",
      u("1517991104123-1d56a6e81ed9"),
      u("1493663284031-b7e3aefcae8e"),
      u("1618220179428-22790b461013"),
      u("1618221195711-dd6afb41a81b"),
    ],
    productSlugs: ["brass-arc-floor-lamp", "glass-globe-wall-sconce", "brass-plant-stand-with-pot"],
  },
  {
    id: "ar3",
    slug: "terra-toscana",
    name: "Terra Toscana",
    location: "Tuscany, Italy",
    founded: "1985",
    craft: "Terracotta and stoneware",
    story: [
      "A cooperative of five potters works with clay dug from the same riverbank their grandparents used. Each planter is thrown on the wheel, then hand-cut with vertical ribs that catch the light differently at every hour of the day. The clay is fired in a wood kiln that gives each piece a slightly different tone, depending on where it sat in the stack.",
      "Terra Toscana was founded in 1985 by a group of friends who had grown up around the clay pits of Impruneta, a hill town south of Florence that has produced terracotta since Etruscan times. The cooperative structure was deliberate: every potter owns an equal share, every decision is made by consensus, every wage is the same. It still works that way.",
      "The clay itself is the secret. It is dug from a riverbank on the cooperative's land, aged in pits for two years, and wedged by hand before each piece. The mineral content  high in iron, low in calcium  gives fired pieces their characteristic warm rose colour, deeper and more alive than the factory-pressed terracotta sold in garden centres.",
      "The wood kiln is fired four times a year. Each firing takes thirty-six hours and consumes four cords of sustainably-harvested oak from a neighbouring estate. The kiln reaches 1080C and is allowed to cool naturally for three days. Pots near the firebox are deeper red; pots near the chimney are paler. No two pieces leave the kiln the same colour.",
      "Aura Living's relationship with Terra Toscana began with a single commission in 2022: the ribbed planter that became our bestselling piece that year. We now carry three of their forms, all thrown by hand, all fired in the wood kiln. The wait between order and shipment is eight weeks  the time it takes for the next firing.",
    ],
    image: "/hero/slide-3.png",
    gallery: [
      "/hero/slide-3.png",
      "/hero/slide-4.png",
      "/hero/about.png",
      "/hero/journal.png",
      u("1493663284031-b7e3aefcae8e"),
      u("1463320726281-696a485928c7"),
      u("1466692476868-aef1dfb1e735"),
      u("1459411552884-841db9b3cc2a"),
    ],
    productSlugs: ["terracotta-ribbed-planter"],
  },
  {
    id: "ar4",
    slug: "lin-belge",
    name: "Lin Belge",
    location: "Ghent, Belgium",
    founded: "2001",
    craft: "Belgian linen textiles",
    story: [
      "A small atelier in Ghent that sews linen shades from unbleached Belgian flax. The flax is grown within 200 kilometres of the workshop. Founded by Sofie Devos, a textile designer who left fast fashion to make things that last. Every seam is triple-stitched; every hem is rolled by hand.",
      "Sofie founded Lin Belge in 2001, after a decade designing for a Belgian fashion house where she watched seasonal collections burned at the end of each cycle. She started the atelier with two second-hand sewing machines, a single client, and a vow: no seasonal collections, no synthetic fibres, no pieces designed to be replaced. Twenty-three years later, the vow holds.",
      "The linen itself is grown, retted, scutched, and spun within a 200-kilometre radius of the workshop  a supply chain so short that Sofie can name the farmer who grew the flax for every shade. The flax is retted in the field (dew-retted, not water-retted), which gives Belgian linen its characteristic oatmeal tone and uneven slub.",
      "The atelier sews on three machines: a 1972 Singer for straight seams, a 1985 Juki for the triple-stitched hems, and a hand-cranked blind-hem machine that nobody under seventy knows how to operate. Sofie's aunt, who is seventy-four, comes in on Tuesdays to do the blind hems. She has trained one apprentice, who is fifty-eight.",
      "Every Aura linen shade is sewn from a single length of fabric, with the selvedge preserved on one edge as a maker's mark. The fabric softens with use; the colour deepens with light. After five years, a Lin Belge shade looks better than the day it arrived. After twenty, it becomes an heirloom.",
    ],
    image: "/hero/slide-1.png",
    gallery: [
      "/hero/slide-1.png",
      "/hero/slide-2.png",
      "/hero/lookbook.png",
      "/hero/shop.png",
      u("1513519245088-0e12902e5a38"),
      u("1485955900006-10f4d324d411"),
      u("1532634922-8fe0b757fb13"),
      u("1582461545998-0a1dcdc62820"),
    ],
    productSlugs: ["linen-pendant-light"],
  },
];

export const artisanBySlug = (slug: string) => artisans.find((a) => a.slug === slug);

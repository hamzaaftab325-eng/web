export interface CareGuide { id: string; slug: string; title: string; material: string; excerpt: string; body: { type: "paragraph" | "heading" | "list"; text?: string; items?: string[] }[]; }

export const careGuides: CareGuide[] = [
  { id: "cg1", slug: "caring-for-ceramic", title: "Caring for Ceramic", material: "Ceramic", excerpt: "Stoneware, porcelain, and earthenware — how to keep your ceramic pieces looking their best.", body: [
    { type: "paragraph", text: "Ceramic is one of the most durable materials in the home — a well-made stoneware vessel can last centuries. But it does require a few simple habits." },
    { type: "heading", text: "Daily care" },
    { type: "list", items: ["Dust with a soft, dry cloth weekly", "Wipe spills immediately — ceramic is porous at the unglazed base", "Avoid sudden temperature changes"] },
    { type: "heading", text: "Deep cleaning" },
    { type: "paragraph", text: "Use warm water and a mild soap. Avoid abrasive scrubbers. For stubborn stains, a paste of baking soda and water left for 15 minutes will lift most marks." },
  ]},
  { id: "cg2", slug: "caring-for-brass", title: "Caring for Brass", material: "Brass", excerpt: "Raw brass, antiqued brass, and sealed brass — when to polish, when to patina.", body: [
    { type: "paragraph", text: "Brass is a living metal — it changes over time, developing a patina that many consider more beautiful than the original shine." },
    { type: "heading", text: "Raw brass (unsealed)" },
    { type: "paragraph", text: "Raw brass will oxidize naturally, deepening from bright gold to warm ochre. To restore shine, use a brass cleaner and soft cloth." },
    { type: "heading", text: "Antiqued brass (sealed)" },
    { type: "paragraph", text: "Our antiqued brass is sealed to prevent further oxidation. Dust with a dry cloth — do not use brass polish." },
  ]},
  { id: "cg3", slug: "caring-for-wood", title: "Caring for Wood", material: "Wood", excerpt: "Oak, walnut, and hard-wax oiled finishes — maintaining the warmth of natural wood.", body: [
    { type: "paragraph", text: "Wood is a natural material that responds to its environment. It expands and contracts with humidity and deepens in color with light." },
    { type: "heading", text: "Maintenance" },
    { type: "list", items: ["Dust with a soft, dry cloth", "Re-oil annually with a food-safe hard-wax oil", "Wipe spills immediately", "Avoid direct sunlight"] },
  ]},
  { id: "cg4", slug: "caring-for-linen", title: "Caring for Linen", material: "Linen", excerpt: "Belgian linen shades and textiles — cleaning and softening over time.", body: [
    { type: "paragraph", text: "Linen is stronger than cotton, more breathable, and softens with every wash. Our Belgian linen starts with a natural oatmeal tone and deepens to warm ivory." },
    { type: "heading", text: "Lamp shades" },
    { type: "paragraph", text: "Vacuum gently with a brush attachment. Do not wash or saturate. For spots, use a barely damp cloth and blot." },
  ]},
  { id: "cg5", slug: "caring-for-plants", title: "Caring for Indoor Plants", material: "Plants", excerpt: "Light, water, and the habits that keep them thriving.", body: [
    { type: "paragraph", text: "The most common mistake is overwatering. When in doubt, wait another day." },
    { type: "heading", text: "Watering" },
    { type: "paragraph", text: "Water when the top 3-5cm of soil feels dry — about once a week in summer, every 10-14 days in winter. Always empty the saucer after watering." },
    { type: "heading", text: "Common problems" },
    { type: "list", items: ["Yellow leaves: usually overwatering", "Brown crispy edges: low humidity", "Dropping leaves: sudden temperature change"] },
  ]},
  { id: "cg6", slug: "caring-for-stone", title: "Caring for Stone", material: "Stone", excerpt: "Marble, obsidian, and concrete — sealing, cleaning, and preventing stains.", body: [
    { type: "paragraph", text: "Natural stone is porous — it will absorb liquids and stain if not properly sealed. All our stone pieces come pre-sealed." },
    { type: "heading", text: "Marble" },
    { type: "list", items: ["Wipe spills immediately — sensitive to acids", "Clean with warm water and mild soap", "Re-seal annually"] },
  ]},
  { id: "cg7", slug: "caring-for-glass", title: "Caring for Glass", material: "Glass", excerpt: "Smoked glass, clear glass, and beveled mirrors — streak-free cleaning.", body: [
    { type: "paragraph", text: "Glass is the easiest material to care for — but the hardest to get streak-free. Use a microfiber cloth, not paper towels." },
    { type: "list", items: ["Spray the cloth, not the glass", "Wipe in a Z-pattern", "Allow glass to cool before cleaning"] },
  ]},
];
export const careGuideBySlug = (slug: string) => careGuides.find((g) => g.slug === slug);

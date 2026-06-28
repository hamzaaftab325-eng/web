/**
 * Generate simple PWA icons (192x192 and 512x512) with the Aura "A" mark.
 * Uses sharp to create solid-color PNGs with a centered letter.
 */
import sharp from "sharp";
import path from "path";

const OUT_DIR = path.resolve(__dirname, "..", "public", "icons");

// Gold circle on cream background with "A" — minimal but on-brand
function svg(size: number): string {
  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="#FAF7F0"/>
    <circle cx="${size/2}" cy="${size/2}" r="${size*0.35}" fill="#D4AF37"/>
    <text x="${size/2}" y="${size*0.62}" font-family="Georgia, serif" font-size="${size*0.4}" font-weight="400" fill="#FAF7F0" text-anchor="middle">A</text>
  </svg>`;
}

async function gen() {
  for (const size of [192, 512]) {
    const out = path.join(OUT_DIR, `icon-${size}.png`);
    await sharp(Buffer.from(svg(size))).png().toFile(out);
    console.log(`✓ ${out}`);
  }
}

gen().catch((e) => { console.error(e); process.exit(1); });

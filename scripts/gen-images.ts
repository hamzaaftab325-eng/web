/**
 * Aura Living — Premium Hero Image Generator
 *
 * Generates four editorial-style hero images for the Aura Living e-commerce
 * hero slider, using the z-ai-web-dev-sdk image generation API.
 *
 * IMPORTANT: z-ai-web-dev-sdk MUST be used in backend code only. This script
 * is executed directly via Bun (server-side) and never imported by client code.
 */

import ZAI from "z-ai-web-dev-sdk";
import fs from "fs";
import path from "path";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const PROJECT_ROOT = path.resolve(__dirname, "..");
const OUTPUT_DIR = path.join(PROJECT_ROOT, "public", "hero");

const IMAGE_SIZE = "1344x768"; // landscape hero

// Retry configuration for rate-limit (429) handling.
const MAX_RETRIES = 5;
const RATE_LIMIT_DELAY_MS = 25_000; // 25s per spec
const GENERIC_BACKOFF_BASE_MS = 2_000;

interface HeroImageJob {
  filename: string;
  prompt: string;
}

const JOBS: HeroImageJob[] = [
  {
    filename: "slide-1.png",
    prompt:
      "Editorial interior photograph of a warm sunlit living room corner, a brass arc floor lamp curving over a low linen sofa, an arched oak floor mirror leaning against a cream plaster wall, a single white ceramic vase with dried botanicals on a low wooden stool, soft afternoon light casting long shadows, warm minimalism, quiet luxury, muted beige and cream palette with antique brass accents, shot on medium format film, no people, no text, photorealistic, high detail",
  },
  {
    filename: "slide-2.png",
    prompt:
      "Editorial still-life photograph of a curated console table against a warm white wall, a sculptural ceramic table lamp with linen shade glowing softly, a stack of art books, a small hand-painted blue and white ceramic pot with a single stem, a smoky glass globe wall sconce casting a warm halo, dried palm frond in shadow, warm bronze and ivory palette, soft directional daylight, architectural digest style, no people, no text, photorealistic",
  },
  {
    filename: "slide-3.png",
    prompt:
      "Editorial interior photograph of a quiet reading nook by a tall window, a matte black sculptural desk lamp on a small wooden side table, a fiddle leaf fig plant in a ribbed terracotta planter, a single linen cushion on a low oak bench, sheer linen curtains diffusing warm afternoon light, cream and oatmeal palette with terracotta and brass accents, warm minimalism, architectural digest style, no people, no text, photorealistic",
  },
  {
    filename: "slide-4.png",
    prompt:
      "Editorial still-life photograph of a warm minimalist shelf vignette, a hand-painted ceramic pot, a stack of small art books topped with an obsidian bookend, a folded seagrass basket below, a single pressed botanical frame on the wall above, a thin brass candle holder with a lit beeswax taper, warm cream and oak palette with antique brass and ivory accents, soft directional daylight, architectural digest aesthetic, no people, no text, photorealistic",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isRateLimitError(error: unknown): boolean {
  if (!error) return false;
  // Check by status property first
  const anyErr = error as { status?: number; statusCode?: number; message?: string };
  const status = anyErr.status ?? anyErr.statusCode;
  if (status === 429) return true;

  const message = (anyErr.message ?? "").toLowerCase();
  return message.includes("429") || message.includes("rate limit") || message.includes("rate_limit");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface GenerateResult {
  success: boolean;
  path: string;
  bytes: number;
  attempts: number;
  error?: string;
}

/**
 * Generate a single hero image with retry logic. Retries on 429 rate-limit
 * errors with a fixed 25s delay; other transient errors use exponential
 * backoff.
 */
async function generateHeroImage(
  zai: Awaited<ReturnType<typeof ZAI.create>>,
  job: HeroImageJob,
): Promise<GenerateResult> {
  const outputPath = path.join(OUTPUT_DIR, job.filename);
  let lastError: unknown = null;
  let attempts = 0;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    attempts = attempt;
    try {
      const response = await zai.images.generations.create({
        prompt: job.prompt,
        size: IMAGE_SIZE,
      });

      const base64 = response?.data?.[0]?.base64;
      if (!base64) {
        throw new Error("Invalid response: missing data[0].base64");
      }

      const buffer = Buffer.from(base64, "base64");
      if (buffer.length < 1024) {
        throw new Error(`Generated image too small (${buffer.length} bytes), likely corrupted`);
      }

      fs.writeFileSync(outputPath, buffer);

      console.log(
        `  ✓ [attempt ${attempt}] ${job.filename} — ${buffer.length.toLocaleString()} bytes`,
      );
      return { success: true, path: outputPath, bytes: buffer.length, attempts };
    } catch (error) {
      lastError = error;
      const rateLimited = isRateLimitError(error);
      const msg = error instanceof Error ? error.message : String(error);
      console.warn(
        `  ⚠ [attempt ${attempt}] ${job.filename} failed (${rateLimited ? "429 rate limit" : "error"}): ${msg}`,
      );

      if (attempt < MAX_RETRIES) {
        const delay = rateLimited
          ? RATE_LIMIT_DELAY_MS
          : GENERIC_BACKOFF_BASE_MS * Math.pow(2, attempt - 1);
        console.warn(`    → retrying in ${Math.round(delay / 1000)}s…`);
        await sleep(delay);
      }
    }
  }

  const msg = lastError instanceof Error ? lastError.message : String(lastError);
  return { success: false, path: outputPath, bytes: 0, attempts, error: msg };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  // Ensure the /hero output directory exists.
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`Output directory: ${OUTPUT_DIR}`);

  console.log("Initializing z-ai-web-dev-sdk…");
  const zai = await ZAI.create();

  console.log(`Generating ${JOBS.length} hero images at ${IMAGE_SIZE}…\n`);

  const results: GenerateResult[] = [];
  for (const job of JOBS) {
    console.log(`▶ ${job.filename}`);
    const result = await generateHeroImage(zai, job);
    results.push(result);
  }

  // Summary
  const succeeded = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log("\n──────────────────────────────────────────────────────");
  console.log("Summary");
  console.log("──────────────────────────────────────────────────────");
  for (const r of results) {
    const status = r.success ? "✓ SUCCESS" : "✗ FAILED ";
    const sizeStr = r.success ? `${r.bytes.toLocaleString()} bytes` : "—";
    console.log(`  ${status}  ${path.basename(r.path)}  (${sizeStr}, ${r.attempts} attempt(s))${r.error ? `  err=${r.error}` : ""}`);
  }
  console.log("──────────────────────────────────────────────────────");
  console.log(`Total: ${succeeded.length}/${results.length} succeeded`);

  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("Fatal error in image generation script:", err);
  process.exitCode = 1;
});

/**
 * Aura Living — Extra Page Hero Image Generator
 *
 * Generates six additional editorial-style page hero images
 * (Collections / Sustainability / Artisans / Trade / Care / Gifts) for the
 * Aura Living site, using the z-ai-web-dev-sdk image generation API.
 *
 * Mirrors the structure of `gen-page-heroes.ts` (same retry logic, rate-limit
 * handling, output format, and summary reporting).
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

const IMAGE_SIZE = "1344x768"; // landscape hero — matches existing heroes

// Retry configuration for rate-limit (429) handling.
const MAX_RETRIES = 5;
const RATE_LIMIT_DELAY_MS = 25_000; // 25s per spec
const GENERIC_BACKOFF_BASE_MS = 2_000;

interface HeroImageJob {
  filename: string;
  prompt: string;
}

const ALL_JOBS: HeroImageJob[] = [
  {
    filename: "collections.png",
    prompt:
      "Editorial interior photograph of three curated room vignettes side by side, each styled around a different palette — warm beige, deep brass, soft cream — with ceramics, lamps, and textiles arranged on a long console, soft gallery lighting, photorealistic, warm minimalism, no text, no people",
  },
  {
    filename: "sustainability.png",
    prompt:
      "Editorial still-life photograph of natural raw materials arranged on a warm oak surface — a heap of stoneware clay, a folded stack of unbleached Belgian linen, a length of solid brass rod, a sprig of flax, a piece of Carrara marble — soft directional daylight, cream and earth-tone palette, photorealistic, no text",
  },
  {
    filename: "artisans.png",
    prompt:
      "Editorial photograph of an artisan's workshop interior — a pottery wheel with a half-thrown vessel, wooden shelves of glaze jars, brass tools hanging on a pegboard, soft window light, warm earthy palette, photorealistic, no people, no text",
  },
  {
    filename: "trade.png",
    prompt:
      "Editorial interior photograph of a design studio meeting table — large format paper swatches, brass and ceramic material samples, a measuring tape, an open catalogue, a cup of black coffee, warm directional light from a side window, cream and gold palette, photorealistic, no people, no text",
  },
  {
    filename: "care.png",
    prompt:
      "Editorial still-life photograph of care tools arranged on a linen cloth — a soft horsehair brush, a microfiber cloth, a small bottle of beeswax polish, a piece of unbleached linen, a dried fern frond — soft daylight, cream and sage palette, photorealistic, no text",
  },
  {
    filename: "gifts.png",
    prompt:
      "Editorial photograph of a beautifully wrapped gift on a warm oak surface — cream paper with a gold-foil seal, a hand-tied linen ribbon, a sprig of dried eucalyptus, a small ceramic vessel beside it, soft warm light, cream and gold palette, photorealistic, no text",
  },
];

// Skip any job whose target file already exists with a valid size (> 1024
// bytes). This makes the script idempotent — safe to re-run after partial
// completion or interruption.
const MIN_VALID_BYTES = 1024;
const JOBS: HeroImageJob[] = ALL_JOBS.filter((job) => {
  const target = path.join(OUTPUT_DIR, job.filename);
  if (fs.existsSync(target)) {
    const stat = fs.statSync(target);
    if (stat.size > MIN_VALID_BYTES) {
      process.stdout.write(`↷ skipping ${job.filename} (already exists, ${stat.size.toLocaleString()} bytes)\n`);
      return false;
    }
  }
  return true;
});

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

      process.stdout.write(
        `  ✓ [attempt ${attempt}] ${job.filename} — ${buffer.length.toLocaleString()} bytes\n`,
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
  process.stdout.write(`Output directory: ${OUTPUT_DIR}\n`);

  process.stdout.write("Initializing z-ai-web-dev-sdk…\n");
  const zai = await ZAI.create();

  process.stdout.write(`Generating ${JOBS.length} page hero images at ${IMAGE_SIZE}…\n\n`);

  const results: GenerateResult[] = [];
  for (const job of JOBS) {
    process.stdout.write(`▶ ${job.filename}\n`);
    const result = await generateHeroImage(zai, job);
    results.push(result);
  }

  // Summary
  const succeeded = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  process.stdout.write("\n──────────────────────────────────────────────────────\n");
  process.stdout.write("Summary\n");
  process.stdout.write("──────────────────────────────────────────────────────\n");
  for (const r of results) {
    const status = r.success ? "✓ SUCCESS" : "✗ FAILED ";
    const sizeStr = r.success ? `${r.bytes.toLocaleString()} bytes` : "—";
    process.stdout.write(
      `  ${status}  ${path.basename(r.path)}  (${sizeStr}, ${r.attempts} attempt(s))${r.error ? `  err=${r.error}` : ""}\n`,
    );
  }
  process.stdout.write("──────────────────────────────────────────────────────\n");
  process.stdout.write(`Total: ${succeeded.length}/${results.length} succeeded\n`);

  if (failed.length > 0) {
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("Fatal error in image generation script:", err);
  process.exitCode = 1;
});

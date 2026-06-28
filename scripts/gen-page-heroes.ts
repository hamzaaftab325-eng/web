/**
 * Aura Living — Page Hero Image Generator
 *
 * Generates four editorial-style page hero images (About / Shop / Lookbook /
 * Journal) for the Aura Living site, using the z-ai-web-dev-sdk image
 * generation API.
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
    filename: "about.png",
    prompt:
      "Editorial photograph of a ceramics workshop, hands shaping a vessel on a pottery wheel, warm natural light, clay dust in the air, artisan tools on a wooden bench, warm earthy palette, photorealistic, no text",
  },
  {
    filename: "shop.png",
    prompt:
      "Editorial interior photograph of a curated home décor showroom, multiple vignettes of lamps mirrors and ceramics arranged on warm wood shelves, soft gallery lighting, cream and gold palette, photorealistic, no text",
  },
  {
    filename: "lookbook.png",
    prompt:
      "Editorial interior photograph of a beautifully styled living room, warm afternoon light streaming through sheer curtains, a brass lamp ceramic vase and arched mirror arranged on a console, warm minimalism, photorealistic, no text",
  },
  {
    filename: "journal.png",
    prompt:
      "Editorial still life of a wooden desk with an open notebook, a fountain pen, a cup of coffee, and a small ceramic vase with dried flowers, warm directional light, cream and oak palette, photorealistic, no text",
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

  console.log(`Generating ${JOBS.length} page hero images at ${IMAGE_SIZE}…\n`);

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

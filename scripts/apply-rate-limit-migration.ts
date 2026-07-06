/**
 * One-shot migration runner — creates the `increment_rate_limit` Postgres
 * function in your Supabase DB. Idempotent (uses CREATE OR REPLACE).
 *
 * Run with: bun run scripts/apply-rate-limit-migration.ts
 */
import { config } from "dotenv";
// Force override — system env may have a stale SQLite DATABASE_URL.
config({ path: ".env", override: true });

import { db } from "../src/lib/db";

const SQL = `
CREATE OR REPLACE FUNCTION increment_rate_limit(
  p_key       TEXT,
  p_window_ms INTEGER,
  p_max       INTEGER
) RETURNS TABLE(
  count     INTEGER,
  reset_at  TIMESTAMPTZ,
  allowed   BOOLEAN
) AS $$
DECLARE
  v_count    INTEGER;
  v_reset_at TIMESTAMPTZ;
  v_now      TIMESTAMPTZ := NOW();
  v_window   INTERVAL    := make_interval(secs => p_window_ms / 1000.0);
BEGIN
  INSERT INTO "RateLimitCounter" ("key", "count", "resetAt", "updatedAt")
  VALUES (p_key, 1, v_now + v_window, v_now)
  ON CONFLICT ("key") DO UPDATE
    SET
      "count"     = CASE
                      WHEN "RateLimitCounter"."resetAt" > v_now
                        THEN "RateLimitCounter"."count" + 1
                      ELSE 1
                    END,
      "resetAt"   = CASE
                      WHEN "RateLimitCounter"."resetAt" > v_now
                        THEN "RateLimitCounter"."resetAt"
                      ELSE v_now + v_window
                    END,
      "updatedAt" = v_now
  RETURNING "RateLimitCounter"."count", "RateLimitCounter"."resetAt"
    INTO v_count, v_reset_at;

  RETURN QUERY SELECT v_count, v_reset_at, (v_count <= p_max);
END;
$$ LANGUAGE plpgsql;
`;

async function main() {
  console.log("→ Creating increment_rate_limit function...");
  await db.$executeRawUnsafe(SQL);
  console.log("✓ Function created (or replaced) successfully.");

  // Verify by invoking it once with a test key
  console.log("→ Verifying with a test call...");
  const result = await db.$queryRaw<{ count: number; reset_at: Date; allowed: boolean }[]>`
    SELECT * FROM increment_rate_limit('migration-test-key', 60000, 5)
  `;
  console.log("✓ Test call result:", result[0]);

  // Clean up the test row
  await db.rateLimitCounter.delete({ where: { key: "migration-test-key" } });
  console.log("✓ Test row cleaned up.");

  console.log("\n✅ Migration complete. Rate limiting is ready to use.");
}

main()
  .catch((error) => {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

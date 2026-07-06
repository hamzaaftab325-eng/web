-- ──────────────────────────────────────────────────────────────────────────
-- Atomic rate-limit increment function.
--
-- Used by src/lib/rate-limit.ts (Edge middleware) via the Supabase REST API
-- (POST /rest/v1/rpc/increment_rate_limit) to do an atomic UPSERT + counter
-- increment in a single round-trip. Replaces the Vercel KV INCR/EXPIRE pattern.
--
-- Run this ONCE in the Supabase dashboard:
--   SQL Editor → New query → paste this file → Run
--
-- The "RateLimitCounter" table is created by `prisma db push` (see
-- prisma/schema.prisma) — this file only adds the function.
-- ──────────────────────────────────────────────────────────────────────────

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

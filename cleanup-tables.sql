-- ============================================================
-- Aura Living — Database Cleanup SQL
-- Run this in the Supabase SQL Editor to drop removed tables.
-- Order matters: drop tables with foreign keys first.
-- ============================================================

-- 1. Analytics tables (no FKs)
DROP TABLE IF EXISTS "CartEvent" CASCADE;
DROP TABLE IF EXISTS "SearchLog" CASCADE;
DROP TABLE IF EXISTS "ProductView" CASCADE;
DROP TABLE IF EXISTS "PageView" CASCADE;

-- 2. Rate limiting (no FKs)
DROP TABLE IF EXISTS "RateLimitCounter" CASCADE;

-- 3. Content tables (no FKs)
DROP TABLE IF EXISTS "InstagramPost" CASCADE;
DROP TABLE IF EXISTS "SustainabilityContent" CASCADE;
DROP TABLE IF EXISTS "ExitIntentPopup" CASCADE;
DROP TABLE IF EXISTS "PressFeature" CASCADE;
DROP TABLE IF EXISTS "BrandMarqueeItem" CASCADE;
DROP TABLE IF EXISTS "Artisan" CASCADE;

-- 4. Optionally: drop the rate-limit Postgres function if it exists
DROP FUNCTION IF EXISTS increment_rate_limit CASCADE;
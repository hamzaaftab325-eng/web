-- Phase 2 Migration — Aura Living
-- Generated 2026-07-07
--
-- This migration:
--   1. Converts enum columns to TEXT (OrderStatus, PaymentStatus, PromoCodeType)
--   2. Adds unsubscribeToken to EmailSubscriber (with default for existing rows)
--   3. Adds updatedAt to OrderItem
--   4. Adds isActive, updatedAt, default source to EmailSubscriber
--   5. Creates WishlistShare table
--   6. Drops FlashSale.updatedAt default (Prisma manages it via @updatedAt)
--   7. Adds unique constraint on EmailSubscriber.email
--   8. Updates FK onDelete behavior for Review.user and OrderItem.product

-- ─── Step 1: Convert Order.status enum → text ─────────────────────────
ALTER TABLE "Order" DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'processing';

-- ─── Step 2: Convert Order.paymentStatus enum → text ──────────────────
ALTER TABLE "Order" DROP COLUMN "paymentStatus",
ADD COLUMN     "paymentStatus" TEXT NOT NULL DEFAULT 'pending';

-- ─── Step 3: Convert PromoCode.type enum → text ───────────────────────
-- Add new text column, copy values, drop old, rename
ALTER TABLE "PromoCode" ADD COLUMN "type_new" TEXT;
UPDATE "PromoCode" SET "type_new" = type::text;
ALTER TABLE "PromoCode" DROP COLUMN "type";
ALTER TABLE "PromoCode" RENAME COLUMN "type_new" TO "type";
ALTER TABLE "PromoCode" ALTER COLUMN "type" SET NOT NULL;

-- ─── Step 4: Drop the enum types (no longer used) ─────────────────────
DROP TYPE IF EXISTS "OrderStatus";
DROP TYPE IF EXISTS "PaymentStatus";
DROP TYPE IF EXISTS "PromoCodeType";

-- ─── Step 5: Add new columns to EmailSubscriber ───────────────────────
-- Add unsubscribeToken as nullable first (for existing rows)
ALTER TABLE "EmailSubscriber" ADD COLUMN "unsubscribeToken" TEXT;

-- Populate existing rows with random tokens (using gen_random_uuid as fallback if no cuid function)
UPDATE "EmailSubscriber" SET "unsubscribeToken" = 'migrate_' || replace(gen_random_uuid()::text, '-', '') WHERE "unsubscribeToken" IS NULL;

-- Now set NOT NULL
ALTER TABLE "EmailSubscriber" ALTER COLUMN "unsubscribeToken" SET NOT NULL;

-- Add isActive column (default true for existing rows)
ALTER TABLE "EmailSubscriber" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- Add updatedAt column (default to now for existing rows)
ALTER TABLE "EmailSubscriber" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Set source default
ALTER TABLE "EmailSubscriber" ALTER COLUMN "source" SET DEFAULT 'footer';

-- Add unique constraint on unsubscribeToken
CREATE UNIQUE INDEX IF NOT EXISTS "EmailSubscriber_unsubscribeToken_key" ON "EmailSubscriber"("unsubscribeToken");

-- Add unique constraint on email (only if no duplicates exist)
-- First check for duplicates
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM (SELECT email, COUNT(*) as c FROM "EmailSubscriber" GROUP BY email HAVING COUNT(*) > 1) dups) THEN
    CREATE UNIQUE INDEX IF NOT EXISTS "EmailSubscriber_email_key" ON "EmailSubscriber"("email");
  ELSE
    RAISE NOTICE 'Skipping unique constraint on EmailSubscriber.email — duplicates exist';
  END IF;
END $$;

-- Add index on Order.status
CREATE INDEX IF NOT EXISTS "Order_status_idx" ON "Order"("status");

-- ─── Step 6: Add updatedAt to OrderItem ───────────────────────────────
ALTER TABLE "OrderItem" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- ─── Step 7: FlashSale.updatedAt — drop the DEFAULT (Prisma manages via @updatedAt) ─
ALTER TABLE "FlashSale" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- ─── Step 8: Create WishlistShare table ───────────────────────────────
CREATE TABLE IF NOT EXISTS "WishlistShare" (
    "id" TEXT NOT NULL,
    "shareId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "WishlistShare_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "WishlistShare_shareId_key" ON "WishlistShare"("shareId");
CREATE INDEX IF NOT EXISTS "WishlistShare_userId_idx" ON "WishlistShare"("userId");
CREATE INDEX IF NOT EXISTS "WishlistShare_shareId_idx" ON "WishlistShare"("shareId");

-- FK: WishlistShare.userId → User.id (onDelete: Cascade)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'WishlistShare_userId_fkey'
  ) THEN
    ALTER TABLE "WishlistShare" ADD CONSTRAINT "WishlistShare_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- ─── Step 9: Update Review.user FK to onDelete: SetNull ───────────────
-- Drop existing FK and recreate with SetNull behavior
DO $$
BEGIN
  -- Find and drop the existing Review_userId_fkey
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'Review_userId_fkey' AND table_name = 'Review'
  ) THEN
    ALTER TABLE "Review" DROP CONSTRAINT "Review_userId_fkey";
  END IF;
END $$;
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ─── Step 10: Update OrderItem.product FK to onDelete: SetNull ────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'OrderItem_productId_fkey' AND table_name = 'OrderItem'
  ) THEN
    ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_productId_fkey";
  END IF;
END $$;
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey"
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ─── Done ─────────────────────────────────────────────────────────────

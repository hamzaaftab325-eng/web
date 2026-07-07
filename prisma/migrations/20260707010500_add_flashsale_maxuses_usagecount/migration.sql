-- Add maxUses, usesCount, and updatedAt columns to FlashSale table.
-- Run this in Supabase SQL Editor.

ALTER TABLE "FlashSale" ADD COLUMN IF NOT EXISTS "maxUses" INTEGER;
ALTER TABLE "FlashSale" ADD COLUMN IF NOT EXISTS "usesCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "FlashSale" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
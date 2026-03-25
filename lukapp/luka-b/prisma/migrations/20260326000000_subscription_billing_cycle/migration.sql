-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'YEARLY');

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN "billingCycle" "BillingCycle" NOT NULL DEFAULT 'MONTHLY';
ALTER TABLE "subscriptions" ADD COLUMN "discountPercent" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "subscriptions" ADD COLUMN "baseAmountCents" INTEGER;

-- Backfill baseAmountCents from existing rows
UPDATE "subscriptions" SET "baseAmountCents" = "amountCents" WHERE "baseAmountCents" IS NULL;

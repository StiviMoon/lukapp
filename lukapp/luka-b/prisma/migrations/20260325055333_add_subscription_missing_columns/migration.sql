-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "autoRenew" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "nextBillingAt" TIMESTAMP(3),
ADD COLUMN     "paymentSourceId" TEXT;

-- CreateTable
CREATE TABLE "payment_sources" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "wompiSourceId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "last4" TEXT,
    "brand" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_sources_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_sources_wompiSourceId_key" ON "payment_sources"("wompiSourceId");

-- CreateIndex
CREATE INDEX "payment_sources_userId_idx" ON "payment_sources"("userId");

-- CreateIndex
CREATE INDEX "subscriptions_nextBillingAt_idx" ON "subscriptions"("nextBillingAt");

-- AddForeignKey
ALTER TABLE "payment_sources" ADD CONSTRAINT "payment_sources_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_paymentSourceId_fkey" FOREIGN KEY ("paymentSourceId") REFERENCES "payment_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

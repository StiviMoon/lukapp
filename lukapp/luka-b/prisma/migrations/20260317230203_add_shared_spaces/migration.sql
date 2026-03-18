-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SpaceRole" AS ENUM ('OWNER', 'MEMBER');

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "status" "ContactStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shared_spaces" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Finanzas compartidas',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shared_spaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "space_members" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "salary" DECIMAL(12,2),
    "role" "SpaceRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "space_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shared_budgets" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "categoryName" TEXT NOT NULL,
    "percentage" DECIMAL(5,2) NOT NULL,
    "period" "BudgetPeriod" NOT NULL DEFAULT 'MONTHLY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shared_budgets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shared_transactions" (
    "id" TEXT NOT NULL,
    "spaceId" TEXT NOT NULL,
    "sharedBudgetId" TEXT,
    "authorId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shared_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contacts_receiverId_idx" ON "contacts"("receiverId");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_requesterId_receiverId_key" ON "contacts"("requesterId", "receiverId");

-- CreateIndex
CREATE UNIQUE INDEX "space_members_spaceId_userId_key" ON "space_members"("spaceId", "userId");

-- CreateIndex
CREATE INDEX "shared_transactions_spaceId_idx" ON "shared_transactions"("spaceId");

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_spaces" ADD CONSTRAINT "shared_spaces_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_members" ADD CONSTRAINT "space_members_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "shared_spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "space_members" ADD CONSTRAINT "space_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_budgets" ADD CONSTRAINT "shared_budgets_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "shared_spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_transactions" ADD CONSTRAINT "shared_transactions_spaceId_fkey" FOREIGN KEY ("spaceId") REFERENCES "shared_spaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_transactions" ADD CONSTRAINT "shared_transactions_sharedBudgetId_fkey" FOREIGN KEY ("sharedBudgetId") REFERENCES "shared_budgets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_transactions" ADD CONSTRAINT "shared_transactions_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

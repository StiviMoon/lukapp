-- CreateEnum
CREATE TYPE "Periodicity" AS ENUM ('ONCE', 'DAILY', 'WEEKLY', 'BI_WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY');

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "periodicity" "Periodicity" NOT NULL DEFAULT 'ONCE';

-- CreateTable
CREATE TABLE "coach_insights" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coach_insights_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "coach_insights_userId_idx" ON "coach_insights"("userId");

-- AddForeignKey
ALTER TABLE "coach_insights" ADD CONSTRAINT "coach_insights_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

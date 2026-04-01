-- CreateTable
CREATE TABLE "coach_chat_messages" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coach_chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "coach_chat_messages_userId_createdAt_idx" ON "coach_chat_messages"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "coach_chat_messages" ADD CONSTRAINT "coach_chat_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "lastWatchedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Video_userId_lastWatchedAt_idx" ON "Video"("userId", "lastWatchedAt");

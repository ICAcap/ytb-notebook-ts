-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "contentText" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE INDEX "Note_userId_contentText_idx" ON "Note"("userId", "contentText");

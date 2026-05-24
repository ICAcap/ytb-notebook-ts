-- CreateIndex
CREATE INDEX "Collection_userId_createdAt_idx" ON "Collection"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Video_userId_createdAt_idx" ON "Video"("userId", "createdAt");

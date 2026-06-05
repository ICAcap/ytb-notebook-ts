/*
  Warnings:

  - A unique constraint covering the columns `[userId,collectionName]` on the table `Collection` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,url]` on the table `Video` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Collection_userId_collectionName_key" ON "Collection"("userId", "collectionName");

-- CreateIndex
CREATE UNIQUE INDEX "Video_userId_url_key" ON "Video"("userId", "url");

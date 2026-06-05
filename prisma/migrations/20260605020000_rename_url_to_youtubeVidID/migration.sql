/*
  Warnings:

  - You are about to drop the index `Video_userId_url_key` on the `Video` table. All the data in the column will be retained.
  - You are about to rename the column `url` on the `Video` table. All the data in the column will be retained.

*/
-- RenameIndex
ALTER INDEX "Video_userId_url_key" RENAME TO "Video_userId_youtubeVidID_key";

-- RenameColumn
ALTER TABLE "Video" RENAME COLUMN "url" TO "youtubeVidID";

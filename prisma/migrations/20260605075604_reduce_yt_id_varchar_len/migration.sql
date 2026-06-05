/*
  Warnings:

  - You are about to alter the column `youtubeVidID` on the `Video` table. The data in that column could be lost. The data in that column will be cast from `VarChar(2048)` to `VarChar(25)`.

*/
-- AlterTable
ALTER TABLE "Video" ALTER COLUMN "youtubeVidID" SET DATA TYPE VARCHAR(25);

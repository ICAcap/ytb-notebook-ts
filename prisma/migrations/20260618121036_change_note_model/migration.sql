/*
  Warnings:

  - You are about to drop the column `timestamp` on the `Note` table. All the data in the column will be lost.
  - Added the required column `endTime` to the `Note` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startTime` to the `Note` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Note" DROP COLUMN "timestamp",
ADD COLUMN     "color" TEXT NOT NULL DEFAULT '#808080',
ADD COLUMN     "endTime" INTEGER NOT NULL,
ADD COLUMN     "screenshotUrl" TEXT,
ADD COLUMN     "startTime" INTEGER NOT NULL;

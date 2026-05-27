/*
  Warnings:

  - You are about to drop the column `lastLoginAt` on the `user` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "user_lastLoginAt_idx";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "lastLoginAt";

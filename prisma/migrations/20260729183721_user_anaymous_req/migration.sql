/*
  Warnings:

  - Made the column `isAnonymous` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "user" ALTER COLUMN "isAnonymous" SET NOT NULL;

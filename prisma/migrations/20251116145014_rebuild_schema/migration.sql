/*
  Warnings:

  - You are about to drop the column `typing` on the `DM` table. All the data in the column will be lost.
  - Made the column `status` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "DM" DROP COLUMN "typing";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'offline';

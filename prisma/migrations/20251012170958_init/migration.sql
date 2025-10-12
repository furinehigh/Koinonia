/*
  Warnings:

  - You are about to drop the column `Mana` on the `Mana` table. All the data in the column will be lost.
  - You are about to drop the column `userSpellsId` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Mana" DROP COLUMN "Mana",
ADD COLUMN     "mana" INTEGER NOT NULL DEFAULT 50;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "userSpellsId";

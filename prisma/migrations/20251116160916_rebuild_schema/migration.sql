/*
  Warnings:

  - You are about to drop the column `isDeleted` on the `Messages` table. All the data in the column will be lost.
  - Added the required column `fromUserId` to the `Messages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Messages" DROP COLUMN "isDeleted",
ADD COLUMN     "deleted" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "fromUserId" TEXT NOT NULL;

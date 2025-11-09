/*
  Warnings:

  - Added the required column `contentId` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "contentId" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

/*
  Warnings:

  - You are about to drop the column `userId` on the `Friends` table. All the data in the column will be lost.
  - Added the required column `receiverId` to the `Friends` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requesterId` to the `Friends` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_id_fkey";

-- DropIndex
DROP INDEX "public"."Friends_userId_key";

-- AlterTable
ALTER TABLE "Friends" DROP COLUMN "userId",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "receiverId" TEXT NOT NULL,
ADD COLUMN     "requesterId" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending';

-- AddForeignKey
ALTER TABLE "Friends" ADD CONSTRAINT "Friends_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friends" ADD CONSTRAINT "Friends_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

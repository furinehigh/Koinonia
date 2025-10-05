/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Koin` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Koin_userId_key" ON "Koin"("userId");

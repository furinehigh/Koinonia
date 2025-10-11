/*
  Warnings:

  - You are about to drop the `Koin` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Koin" DROP CONSTRAINT "Koin_userId_fkey";

-- DropTable
DROP TABLE "public"."Koin";

-- CreateTable
CREATE TABLE "Mana" (
    "id" TEXT NOT NULL,
    "Mana" INTEGER NOT NULL DEFAULT 50,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mana_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Mana_userId_key" ON "Mana"("userId");

-- AddForeignKey
ALTER TABLE "Mana" ADD CONSTRAINT "Mana_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

/*
  Warnings:

  - You are about to drop the `UserSpells` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CommunityToSpell` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_PostToSpell` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `Spell` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."UserSpells" DROP CONSTRAINT "UserSpells_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."_CommunityToSpell" DROP CONSTRAINT "_CommunityToSpell_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_CommunityToSpell" DROP CONSTRAINT "_CommunityToSpell_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_PostToSpell" DROP CONSTRAINT "_PostToSpell_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_PostToSpell" DROP CONSTRAINT "_PostToSpell_B_fkey";

-- AlterTable
ALTER TABLE "Spell" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "public"."UserSpells";

-- DropTable
DROP TABLE "public"."_CommunityToSpell";

-- DropTable
DROP TABLE "public"."_PostToSpell";

-- CreateTable
CREATE TABLE "UserSpell" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "spellId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSpell_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CastSpell" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "spellId" TEXT NOT NULL,
    "postId" TEXT,
    "communityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CastSpell_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserSpell" ADD CONSTRAINT "UserSpell_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSpell" ADD CONSTRAINT "UserSpell_spellId_fkey" FOREIGN KEY ("spellId") REFERENCES "Spell"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CastSpell" ADD CONSTRAINT "CastSpell_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CastSpell" ADD CONSTRAINT "CastSpell_spellId_fkey" FOREIGN KEY ("spellId") REFERENCES "Spell"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CastSpell" ADD CONSTRAINT "CastSpell_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CastSpell" ADD CONSTRAINT "CastSpell_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE SET NULL ON UPDATE CASCADE;

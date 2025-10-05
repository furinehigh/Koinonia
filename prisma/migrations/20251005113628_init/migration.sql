/*
  Warnings:

  - You are about to drop the column `moderators` on the `Community` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Community" DROP COLUMN "moderators";

-- CreateTable
CREATE TABLE "_CommunityModerators" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CommunityModerators_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CommunityModerators_B_index" ON "_CommunityModerators"("B");

-- AddForeignKey
ALTER TABLE "_CommunityModerators" ADD CONSTRAINT "_CommunityModerators_A_fkey" FOREIGN KEY ("A") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CommunityModerators" ADD CONSTRAINT "_CommunityModerators_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

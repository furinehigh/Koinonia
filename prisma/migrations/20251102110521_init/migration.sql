/*
  Warnings:

  - A unique constraint covering the columns `[communityId]` on the table `CommunityMod` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CommunityMod_communityId_key" ON "CommunityMod"("communityId");

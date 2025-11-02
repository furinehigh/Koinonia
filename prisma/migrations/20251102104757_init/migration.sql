-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "isApproved" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "isApproved" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "CommunityMod" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "autoApprovalPost" BOOLEAN NOT NULL DEFAULT true,
    "autoApprovalComment" BOOLEAN NOT NULL DEFAULT true,
    "contentModeration" BOOLEAN NOT NULL DEFAULT true,
    "avoidLinks" BOOLEAN NOT NULL DEFAULT false,
    "restrictedWords" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "CommunityMod_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CommunityMod" ADD CONSTRAINT "CommunityMod_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "isRemoved" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "isRemoved" BOOLEAN NOT NULL DEFAULT false;

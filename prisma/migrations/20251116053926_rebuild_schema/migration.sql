-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastOnlineAt" TIMESTAMP(3),
ADD COLUMN     "status" TEXT;

-- CreateTable
CREATE TABLE "DM" (
    "id" TEXT NOT NULL,
    "friendshipId" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DM_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DM_friendshipId_key" ON "DM"("friendshipId");

-- AddForeignKey
ALTER TABLE "DM" ADD CONSTRAINT "DM_friendshipId_fkey" FOREIGN KEY ("friendshipId") REFERENCES "Friends"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

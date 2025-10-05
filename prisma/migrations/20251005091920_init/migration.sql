-- CreateTable
CREATE TABLE "Koin" (
    "id" TEXT NOT NULL,
    "koins" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Koin_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Koin" ADD CONSTRAINT "Koin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

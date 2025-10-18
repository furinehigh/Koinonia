-- AlterTable
ALTER TABLE "RecentActivity" ADD COLUMN     "spellId" TEXT,
ALTER COLUMN "slug" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "RecentActivity" ADD CONSTRAINT "RecentActivity_spellId_fkey" FOREIGN KEY ("spellId") REFERENCES "Spell"("id") ON DELETE SET NULL ON UPDATE CASCADE;

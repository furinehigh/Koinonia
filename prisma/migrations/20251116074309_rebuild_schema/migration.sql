/*
  Warnings:

  - Added the required column `typing` to the `DM` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DM" ADD COLUMN     "typing" TEXT NOT NULL;

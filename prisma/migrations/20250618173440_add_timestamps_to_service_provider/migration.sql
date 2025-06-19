/*
  Warnings:

  - Added the required column `updatedAt` to the `ServiceProvider` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ServiceProvider" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Update existing records to have proper timestamps
UPDATE "ServiceProvider" SET "createdAt" = CURRENT_TIMESTAMP, "updatedAt" = CURRENT_TIMESTAMP;

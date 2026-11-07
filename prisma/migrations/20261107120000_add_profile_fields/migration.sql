-- AlterTable
ALTER TABLE "User" ADD COLUMN     "areaName" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "careSpecies" "Species"[] DEFAULT ARRAY[]::"Species"[],
ADD COLUMN     "certificateIssuedBy" TEXT,
ADD COLUMN     "certificateName" TEXT;
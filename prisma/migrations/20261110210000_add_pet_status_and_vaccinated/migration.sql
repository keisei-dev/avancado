-- Owner-controlled soft delete for pets.
CREATE TYPE "PetStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

ALTER TABLE "Pet"
  ADD COLUMN "isVaccinated" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "status" "PetStatus" NOT NULL DEFAULT 'ACTIVE';
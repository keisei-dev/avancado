import { prisma } from "../client";
import { seedCategories } from "../categories";
import { seedUsers } from "./users";
import { seedPets } from "./pets";
import { seedRequests } from "./requests";
import { seedCommunity } from "./community";
import { seedPlaces } from "./places";

async function main() {
  // Order matters: a row can only point to rows that already exist.
  await seedCategories();
  await seedUsers();
  await seedPets();
  await seedRequests();
  await seedCommunity();
  await seedPlaces();
  console.log("Demo seed finished.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

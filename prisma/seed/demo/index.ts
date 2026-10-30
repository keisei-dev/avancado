import { prisma } from "../client";
import { seedCategories } from "../categories";
import { seedUsers } from "./users";
import { seedPets } from "./pets";
import { seedRequests } from "./requests";
import { seedCommunity } from "./community";
import { seedPlaces } from "./places";
import { seedConversations } from "./conversations";
import { seedReports } from "./reports";
import { seedNotifications } from "./notifications";

async function main() {
  // Order matters: a row can only point to rows that already exist.
  await seedCategories();
  await seedUsers();
  await seedPets();
  await seedRequests();
  await seedCommunity();
  await seedPlaces();
  await seedConversations(); // needs requests and posts
  await seedReports(); // needs requests, posts and places
  await seedNotifications(); // needs conversations (for the link)
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

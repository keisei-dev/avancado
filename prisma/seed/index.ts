import { prisma } from "./client";
import { seedCategories } from "./categories";

async function main() {
  await seedCategories();
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

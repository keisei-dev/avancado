import { prisma } from "./client";

// Order and names come from the data structure document (PlaceCategory).
const categories = [
  { name: "Parks", slug: "parks", sortOrder: 1 },
  { name: "Food & Drink", slug: "food-drink", sortOrder: 2 },
  { name: "Vets", slug: "vets", sortOrder: 3 },
  { name: "Services", slug: "services", sortOrder: 4 },
  { name: "Shops", slug: "shops", sortOrder: 5 },
  { name: "Stays", slug: "stays", sortOrder: 6 },
  { name: "Trails", slug: "trails", sortOrder: 7 },
];

export async function seedCategories() {
  for (const category of categories) {
    // upsert = update if the slug exists, otherwise create.
    // This makes the seed safe to run many times.
    await prisma.placeCategory.upsert({
      where: { slug: category.slug },
      update: { name: category.name, sortOrder: category.sortOrder },
      create: category,
    });
  }
  console.log(`Seeded ${categories.length} place categories.`);
}

import { prisma } from "../client";
import { demoPlaceIds } from "./places";

const DEMO_EMAIL_SUFFIX = "@seed.avancado.test";

async function main() {
  // Safety switch: this deletes data from the shared database.
  if (!process.argv.includes("--yes")) {
    console.log(
      "This deletes all demo data (users with an @seed.avancado.test email and the demo places).\n" +
        "Run again with --yes to continue: npm run db:seed:demo:clear -- --yes",
    );
    return;
  }

  const demoUsers = await prisma.user.findMany({
    where: { email: { endsWith: DEMO_EMAIL_SUFFIX } },
    select: { id: true },
  });
  const ids = demoUsers.map((user) => user.id);

  // The order matters. Pets cannot be deleted while a request still points to them,
  // and an admin cannot be deleted while the admin has log rows.
  // Deleting a request or a post also deletes its applications, reviews, likes,
  // chats and reports (ON DELETE CASCADE).
  await prisma.sitterRequest.deleteMany({ where: { authorId: { in: ids } } });
  await prisma.communityPost.deleteMany({ where: { authorId: { in: ids } } });
  await prisma.pet.deleteMany({ where: { ownerId: { in: ids } } });
  await prisma.place.deleteMany({ where: { id: { in: demoPlaceIds } } });
  await prisma.adminActionLog.deleteMany({ where: { adminId: { in: ids } } });
  // Deleting a user also deletes what is left: ID checks, notifications, chat rows.
  await prisma.user.deleteMany({ where: { id: { in: ids } } });

  console.log(
    `Removed ${ids.length} demo users and their data. ` +
      "Also delete the demo users in Supabase > Authentication > Users.",
  );
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

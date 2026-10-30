// Notion flow: Profile: View public profile
// TODO: implement

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma/client";
import { Avatar } from "@/components/ui/avatar";

export default async function PublicProfilePage({
  params,
}: PageProps<"/profile/[userId]">) {
  const { userId } = await params;
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      accountStatus: "ACTIVE",
    },
    select: {
      name: true,
      image: true,
      isVerified: true,
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <main className="flex flex-1 flex-col gap-2 p-8">
      <Avatar
        name={user.name}
        src={user.image}
        verified={user.isVerified}
        size="lg"
      />
      <h1 className="text-2xl font-bold">{user.name}</h1>
    </main>
  );
}

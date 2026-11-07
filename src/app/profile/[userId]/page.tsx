import { notFound } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { prisma } from "@/lib/prisma/client";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
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
    <main className="flex flex-col items-center gap-4 p-8">
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

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma/client";
import { getCurrentMember } from "@/lib/auth/member";
import EditProfileForm from "@/components/profile/edit-profile-form";

export default async function EditProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  const member = await getCurrentMember();

  if (!member) {
    redirect("/login");
  }

  const profile = await prisma.user.findUnique({
    where: { id: member.id },
    select: {
      name: true,
      bio: true,
      areaName: true,
      careSpecies: true,
      certificateName: true,
      certificateIssuedBy: true,
    },
  });

  const params = await searchParams;
  const section =
    params.section === "about" || params.section === "sitting"
      ? params.section
      : "all";

  return <EditProfileForm profile={profile} section={section} mode="page" />;
}

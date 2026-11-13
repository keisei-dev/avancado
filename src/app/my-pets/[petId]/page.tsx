// Notion flow: Pet detail and health data log
// Pet dashboard: profile card now, health cards in a later step.

import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { PetProfileCard } from "@/components/my-pets/pet-profile-card";
import { getCurrentMember } from "@/lib/auth/member";
import { getMyPetDetail } from "@/lib/pets/queries";

export default function PetDetailPage({
  params,
}: PageProps<"/my-pets/[petId]">) {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-muted" role="status">
          Loading pet…
        </p>
      }
    >
      <PetDashboard params={params} />
    </Suspense>
  );
}

async function PetDashboard({
  params,
}: {
  params: PageProps<"/my-pets/[petId]">["params"];
}) {
  const { petId } = await params;
  const member = await getCurrentMember();
  if (!member) redirect("/login");

  // null for a wrong id, another member's pet, or an archived pet.
  const detail = await getMyPetDetail(member.id, petId);
  if (!detail) notFound();

  return (
    <div className="flex flex-col gap-6">
      <PetProfileCard pet={detail.pet} />
    </div>
  );
}

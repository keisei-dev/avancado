// Notion flow: Pet detail and health data log
// Pet dashboard: profile card now, health cards in a later step.

import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { PetProfileCard } from "@/components/my-pets/pet-profile-card";
import { getCurrentMember } from "@/lib/auth/member";
import { getMyPetDetail } from "@/lib/pets/queries";
import { ArchivePetButton } from "@/components/my-pets/archive-pet-button";
import { EditPetButton } from "@/components/my-pets/pet-form-modal";

import { HealthCard } from "@/components/my-pets/health-card";
import { LOG_CONFIG } from "@/lib/pets/log-config";
import { LOG_KINDS } from "@/lib/pets/types";

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
      <PetProfileCard
        pet={detail.pet}
        action={
          <div className="flex gap-2 tablet:flex-col tablet:items-end">
            <EditPetButton memberId={member.id} pet={detail.pet} />
            <ArchivePetButton petId={detail.pet.id} petName={detail.pet.name} />
          </div>
        }
      />
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-bold text-brown">
          Health & activity
        </h2>
        <div className="grid gap-4 tablet:grid-cols-2">
          {LOG_KINDS.filter(
            (kind) =>
              !LOG_CONFIG[kind].dogsOnly || detail.pet.species === "DOG",
          ).map((kind) => {
            const logs = detail.logs[kind];
            const latest = logs[0] ? LOG_CONFIG[kind].summary(logs[0]) : null;
            return (
              <HealthCard
                key={kind}
                petId={detail.pet.id}
                kind={kind}
                subtitle={`${logs.length} ${logs.length === 1 ? "entry" : "entries"}`}
              >
                {latest ? (
                  <div>
                    <p className="text-xs text-muted">{latest.meta}</p>
                    <p className="font-semibold text-brown">{latest.title}</p>
                  </div>
                ) : (
                  <p className="text-sm text-muted">Nothing logged yet.</p>
                )}
              </HealthCard>
            );
          })}
        </div>
      </section>
    </div>
  );
}

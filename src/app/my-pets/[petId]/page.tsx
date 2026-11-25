// Notion flow: Pet detail and health data log
// Pet dashboard: profile card now, health cards in a later step.

import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { PetProfileCard } from "@/components/my-pets/pet-profile-card";
import { getCurrentMember } from "@/lib/auth/member";
import { getMyPetDetail } from "@/lib/pets/queries";
import { EditPetButton } from "@/components/my-pets/pet-form-modal";

import { HealthCard } from "@/components/my-pets/health-card";
import {
  EmergencyList,
  FoodList,
  ToiletChart,
  VaccineList,
  VetList,
  WalkChart,
  WeightSummary,
} from "@/components/my-pets/health-card-bodies";

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
  const { pet, logs } = detail;

  return (
    <div className="flex flex-col gap-6">
      <PetProfileCard
        pet={detail.pet}
        action={<EditPetButton memberId={member.id} pet={detail.pet} />}
      />
      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-semibold tracking-[0.06em] text-olive-dark uppercase">
              Health report
            </p>
            <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-brown">
              Health & activity
            </h2>
          </div>
          <span className="text-[13px] text-muted">
            Charts show the last 7 days
          </span>
        </div>

        <div className="grid gap-4 tablet:grid-cols-2">
          <HealthCard
            petId={pet.id}
            kind="toilet"
            subtitle="Daily count · Last 7 days"
          >
            <ToiletChart logs={logs.toilet} />
          </HealthCard>
          <HealthCard petId={pet.id} kind="food" subtitle="Latest meals">
            <FoodList logs={logs.food} />
          </HealthCard>
          <HealthCard petId={pet.id} kind="weight" subtitle="Weigh-in history">
            <WeightSummary logs={logs.weight} />
          </HealthCard>
          <HealthCard
            petId={pet.id}
            kind="vaccine"
            subtitle="Protection record"
            viewLabel="View all"
          >
            <VaccineList logs={logs.vaccine} />
          </HealthCard>
          <HealthCard
            petId={pet.id}
            kind="vet"
            subtitle="Recent appointments"
            viewLabel="View all"
          >
            <VetList logs={logs.vet} />
          </HealthCard>
          <HealthCard
            petId={pet.id}
            kind="emergency"
            subtitle={
              logs.emergency.length > 1
                ? `${logs.emergency.length} contacts`
                : "Primary clinic"
            }
            viewLabel="Manage"
          >
            <EmergencyList logs={logs.emergency} />
          </HealthCard>
          {pet.species === "DOG" && (
            <HealthCard
              petId={pet.id}
              kind="walk"
              subtitle="Minutes per day · Last 7 days"
            >
              <WalkChart logs={logs.walk} />
            </HealthCard>
          )}
        </div>
      </section>
    </div>
  );
}

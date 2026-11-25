// Top card of the pet dashboard: large photo on the left. Server-safe.

import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import {
  genderLabel,
  neuterLabel,
  petAge,
  relativeDay,
  speciesLabel,
} from "@/lib/pets/format";
import type { PetProfile } from "@/lib/pets/types";
import { PetPhoto } from "./pet-photo";

export type PetProfileCardProps = {
  pet: PetProfile;
  action?: ReactNode;
};

export function PetProfileCard({ pet, action }: PetProfileCardProps) {
  const facts = [
    pet.breed,
    petAge(pet.birthDate),
    pet.weight === null ? null : `${pet.weight} kg`,
  ].filter(Boolean);

  return (
    <section className="relative grid gap-5 rounded-20 border border-line bg-white p-4 shadow-card tablet:grid-cols-[200px_minmax(0,1fr)] tablet:items-center tablet:gap-6">
      <PetPhoto
        name={pet.name}
        imageUrl={pet.imageUrl}
        iconSize={40}
        className="h-56 w-full rounded-16 tablet:size-[200px]"
      />

      {/* pr-40 keeps the text away from the buttons in the corner. */}
      <div className="min-w-0 tablet:pr-40">
        <h2 className="font-display text-[28px] font-bold tracking-tight text-brown">
          {pet.name}
        </h2>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Badge tone="default">{speciesLabel(pet.species)}</Badge>
          {pet.gender !== "UNKNOWN" && (
            <Badge tone="default">{genderLabel(pet.gender)}</Badge>
          )}
          {pet.isNeutered && (
            <Badge tone="default">{neuterLabel(pet.gender)}</Badge>
          )}
          <Badge tone={pet.isVaccinated ? "green" : "amber"}>
            {pet.isVaccinated ? "Vaccinated" : "Not vaccinated yet"}
          </Badge>
        </div>
        <p className="mt-2 text-sm text-muted">
          {facts.join(" · ")}
          {facts.length > 0 && " · "}
          Updated {relativeDay(pet.updatedAt)}
        </p>
        {pet.notes && (
          <p className="mt-3 max-w-[520px] text-[15px] leading-relaxed whitespace-pre-line text-brown-2">
            {pet.notes}
          </p>
        )}
      </div>

      {action && (
        <div className="tablet:absolute tablet:top-4 tablet:right-4">
          {action}
        </div>
      )}
    </section>
  );
}

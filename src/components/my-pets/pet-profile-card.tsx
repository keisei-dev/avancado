// Top card of the pet dashboard. Server-safe.

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
  /** The "Edit profile" button. Added in the next step. */
  action?: React.ReactNode;
};

export function PetProfileCard({ pet, action }: PetProfileCardProps) {
  const facts = [
    pet.breed,
    petAge(pet.birthDate),
    pet.weight === null ? null : `${pet.weight} kg`,
  ].filter(Boolean);

  return (
    <section className="flex flex-col gap-4 rounded-20 border border-line bg-white p-5 shadow-card tablet:flex-row tablet:items-start">
      <PetPhoto
        name={pet.name}
        imageUrl={pet.imageUrl}
        className="size-24 rounded-16"
      />
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-2xl font-bold text-brown">
          {pet.name}
        </h1>
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
          <p className="mt-3 text-sm whitespace-pre-line text-brown">
            {pet.notes}
          </p>
        )}
      </div>
      {action}
    </section>
  );
}

// Top card of the pet dashboard. Server-safe.

import { cn } from "@/lib/cn";
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
        <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Pet details">
          <Chip>{speciesLabel(pet.species)}</Chip>
          {pet.gender !== "UNKNOWN" && <Chip>{genderLabel(pet.gender)}</Chip>}
          {pet.isNeutered && <Chip>{neuterLabel(pet.gender)}</Chip>}
          <Chip tone={pet.isVaccinated ? "good" : "warn"}>
            {pet.isVaccinated ? "Vaccinated" : "Not vaccinated yet"}
          </Chip>
        </ul>
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

// Temporary chip. Swap for the UI library's Badge or Chip in the next step.
function Chip({
  children,
  tone = "plain",
}: {
  children: React.ReactNode;
  tone?: "plain" | "good" | "warn";
}) {
  return (
    <li
      className={cn(
        "rounded-full px-2.5 py-1 text-xs font-semibold",
        tone === "plain" && "bg-ivory text-brown-2",
        tone === "good" && "bg-success-soft text-success-ink",
        tone === "warn" && "bg-amber-soft text-amber-ink",
      )}
    >
      {children}
    </li>
  );
}

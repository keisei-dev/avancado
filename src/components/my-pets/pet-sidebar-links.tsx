"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { speciesLabel } from "@/lib/pets/format";
import type { PetSummary } from "@/lib/pets/types";
import { PetPhoto } from "./pet-photo";

export type PetSidebarLinksProps = { pets: PetSummary[] };

// One link per pet. Phones: a row you can swipe. Tablet and up: a column.
export function PetSidebarLinks({ pets }: PetSidebarLinksProps) {
  // The URL part after /my-pets/: a pet id, "new", or null on /my-pets.
  const segment = useSelectedLayoutSegment();

  if (pets.length === 0) return null;

  return (
    <nav
      aria-label="Your pets"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 tablet:mx-0 tablet:flex-col tablet:overflow-visible tablet:px-0"
    >
      {pets.map((pet) => {
        const active = pet.id === segment;
        return (
          <Link
            key={pet.id}
            href={`/my-pets/${pet.id}`}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-w-52 items-center gap-3 rounded-16 border p-2.5 transition-colors tablet:min-w-0",
              active
                ? "border-sage bg-sage-faint"
                : "border-transparent hover:bg-ivory",
            )}
          >
            <PetPhoto name={pet.name} imageUrl={pet.imageUrl} />
            <span className="min-w-0 flex-1">
              <strong className="block truncate text-sm text-brown">
                {pet.name}
              </strong>
              <small className="block truncate text-xs text-muted">
                {pet.breed || speciesLabel(pet.species)}
              </small>
            </span>
            <ChevronRight
              size={18}
              aria-hidden="true"
              className="hidden text-muted tablet:block"
            />
          </Link>
        );
      })}
    </nav>
  );
}

import { Avatar } from "@/components/ui/avatar";
import Link from "next/link";
import {
  Camera,
  ChevronRight,
  PenLine,
  Settings,
  Shield,
  ShieldCheck,
  MapPin,
} from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PetPhoto } from "@/components/my-pets/pet-photo";
import { speciesLabel } from "@/lib/pets/format";
import type { PetProfile } from "@/lib/pets/types";

// The summary card is narrow, so show at most 3 pets
const MAX_PETS = 3;

type ProfileUser = {
  id: string;
  name: string;
  email?: string | null;
  image: string | null;
  isVerified: boolean;
  accountStatus: string;
  createdAt: Date;
  areaName: string | null;
};

export default function ProfileSummaryCard({
  user,
  pets = [],
  canEdit = false,
}: {
  user: ProfileUser;
  pets?: PetProfile[];
  canEdit?: boolean;
}) {
  return (
    <div className="relative flex flex-col items-center gap-3 overflow-hidden rounded-16 border border-line bg-white px-6 pt-8 pb-6">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-20 bg-linear-to-br from-olive to-amber"
      />
      <div className="relative">
        <Avatar
          name={user.name}
          src={user.image}
          size="xl"
          className="rounded-full border-4 border-white"
        />
        {canEdit && (
          <Link
            href="/profile/me/edit"
            className="absolute -right-1 -bottom-1 grid h-8 w-8 place-items-center rounded-full bg-olive text-white transition-colors hover:bg-olive-hover"
          >
            <Camera size={16} aria-hidden="true" />
            <span className="sr-only">Change profile picture</span>
          </Link>
        )}
      </div>

      <div className="flex w-full flex-col items-center gap-2">
        <h1 className="font-display text-xl font-bold">{user.name}</h1>
        {canEdit && user.email &&
          <p className="text-sm text-muted">{user.email}</p>}
        {user.areaName && (
          <p className="text-sm text-muted">
            <MapPin size={16} className="inline-block" aria-hidden="true" />
            {user.areaName}
          </p>
        )}
        {user.isVerified ? (
          <Badge tone="green">
            <span className="flex items-center gap-1">
              <ShieldCheck size={16} aria-hidden="true" />
              Identity Verified
            </span>
          </Badge>
        ) : (
          <Badge tone="amber">
            <span className="flex items-center gap-1">
              <Shield size={16} aria-hidden="true" />
              Not verified
            </span>
          </Badge>
        )}

        {/* Visitors only see this section when there are pets to show */}
        {(canEdit || pets.length > 0) && (
        <section className="mt-3 w-full" aria-labelledby="profile-pets-heading">
          <h2 id="profile-pets-heading" className="mb-2 text-lg font-semibold">
            {canEdit ? "My pets" : `${user.name}'s pets`}
          </h2>
          {pets.length === 0 ? (
            <EmptyState
              title="No pets added yet"
              text="Add a pet to show it on your profile."
              className="py-4"
            />
          ) : (
            <>
              {/* Same row as the My Pets sidebar. Show up to 3 pets. */}
              <ul className="flex flex-col gap-2">
                {pets.slice(0, MAX_PETS).map((pet) => {
                  const row = (
                    <>
                      <PetPhoto name={pet.name} imageUrl={pet.imageUrl} />
                      <span className="min-w-0 flex-1 text-left">
                        <strong className="block truncate text-sm text-brown">
                          {pet.name}
                        </strong>
                        <small className="block truncate text-xs text-muted">
                          {pet.breed || speciesLabel(pet.species)}
                        </small>
                      </span>
                    </>
                  );

                  return (
                    <li key={pet.id}>
                      {canEdit ? (
                        // Owner: open the pet's page in My Pets
                        <Link
                          href={`/my-pets/${pet.id}`}
                          className="flex items-center gap-3 rounded-16 border border-line bg-white p-2.5 transition-colors hover:border-olive hover:bg-sage-faint"
                        >
                          {row}
                          <ChevronRight
                            size={18}
                            aria-hidden="true"
                            className="text-muted"
                          />
                        </Link>
                      ) : (
                        // Visitor: My Pets is private, so no link
                        <div className="flex items-center gap-3 rounded-16 border border-line bg-white p-2.5">
                          {row}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>

              {pets.length > MAX_PETS &&
                (canEdit ? (
                  <Link
                    href="/my-pets"
                    className={`${buttonClass({ variant: "text" })} mt-1`}
                  >
                    View all {pets.length} pets
                  </Link>
                ) : (
                  <p className="mt-2 text-sm text-muted">
                    {`+ ${pets.length - MAX_PETS} more`}
                  </p>
                ))}
            </>
          )}
        </section>
        )}


        {canEdit && (
          <div className="mt-3 flex w-full flex-col gap-2">
            <Link href="/profile/me/edit" className={buttonClass()}>
              <PenLine size={16} aria-hidden="true" />
              Edit profile
            </Link>
            <Link
              href="/profile/me/settings"
              className={buttonClass({ variant: "secondary" })}
            >
              <Settings size={16} aria-hidden="true" />
              Account settings
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

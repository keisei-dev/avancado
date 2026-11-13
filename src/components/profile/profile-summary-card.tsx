// Big photo, name, email, member since, badge, Edit profile and Account settings buttons
import { Avatar } from "@/components/ui/avatar";
import Link from "next/link";
import {
  Camera,
  PenLine,
  Settings,
  Shield,
  ShieldCheck,
  MapPin,
} from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

type ProfilePet = {
  id: string;
  name: string;
  species: string;
  breed: string;
  birthDate: string | null;
  weight: number | null;
  gender: string;
  isNeutered: boolean;
  notes: string | null;
  imageUrl: string | null;
};

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
  pets?: ProfilePet[];
  canEdit?: boolean;
}) {
  return (
    <div className="relative flex flex-col items-center gap-3 overflow-hidden rounded-16 border border-line bg-white px-6 pt-8 pb-6">
      {/* Soft green band behind the photo (decoration only) */}
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
          {pets.length > 0 ? (
            <div className="flex flex-col gap-3">
              {pets.map((pet) => (
                <article
                  key={pet.id}
                  className="rounded-lg border border-line p-3"
                >
                  <div className="flex items-center gap-3">
                    {pet.imageUrl ? (
                      <img
                        src={pet.imageUrl}
                        alt={pet.name}
                        className="size-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="grid size-12 place-items-center rounded-full bg-sage-soft text-xl">
                        🐾
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-semibold">{pet.name}</h3>
                      <p className="truncate text-sm text-muted">
                        {pet.species} · {pet.breed}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-muted">
                    {pet.gender} ·{" "}
                    {pet.isNeutered ? "Neutered" : "Not neutered"}
                  </p>
                  {(pet.birthDate || pet.weight !== null) && (
                    <p className="text-sm text-muted">
                      {pet.birthDate &&
                        `Born ${new Date(pet.birthDate).toLocaleDateString()}`}
                      {pet.birthDate && pet.weight !== null && " · "}
                    </p>
                  )}
                  {pet.notes && (
                    <p className="mt-1 text-sm text-muted">{pet.notes}</p>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No pets added yet"
              text="Add a pet to show it on your profile."
              className="py-4"
            />
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

// Big photo, name, email, member since, badge, Edit profile and Account settings buttons
import { Avatar } from "@/components/ui/avatar";
import Link from "next/link";
import { Camera, PenLine, Settings, Shield, ShieldCheck } from "lucide-react";
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
  email: string;
  image: string | null;
  isVerified: boolean;
  accountStatus: string;
  createdAt: Date;
};

export default function ProfileSummaryCard({
  user,
  pets = [],
}: {
  user: ProfileUser;
  pets?: ProfilePet[];
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg bg-white p-4 shadow-md">
      <div className="relative">
        <Avatar name={user.name} src={user.image} size="xl" />
        <Link
          href="/profile/me/edit"
          className="absolute -right-1 -bottom-1 grid h-8 w-8 place-items-center rounded-full bg-olive text-white shadow-md transition-colors hover:bg-olive-hover"
        >
          <Camera size={16} aria-hidden="true" />
          <span className="sr-only">Change profile picture</span>
        </Link>
      </div>

      <div className="flex w-full flex-col items-center gap-1">
        <h2 className="text-xl font-semibold" aria-label={`Name: ${user.name}`}>
          {user.name}
        </h2>
        <p className="text-gray-600" aria-label={`Email: ${user.email}`}>
          {user.email}
        </p>
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

        <section className="mt-4 w-full" aria-labelledby="profile-pets-heading">
          <h2 id="profile-pets-heading" className="mb-2 text-lg font-semibold">
            My Pets
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

        <div className="mt-4 flex w-full flex-col gap-2">
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
      </div>
    </div>
  );
}

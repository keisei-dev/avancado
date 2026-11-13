// Notion flow: My Pets: View my pets and health dashboard
// Opens the first pet. With no pets yet, shows the empty state.

import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PawPrint, Plus } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentMember } from "@/lib/auth/member";
import { getMyPets } from "@/lib/pets/queries";

export const metadata = { title: "My Pets" };

export default function MyPetsPage() {
  return (
    <Suspense
      fallback={
        <p className="text-sm text-muted" role="status">
          Loading your pets…
        </p>
      }
    >
      <FirstPetOrEmpty />
    </Suspense>
  );
}

async function FirstPetOrEmpty() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");
  const [firstPet] = await getMyPets(member.id);
  if (firstPet) redirect(`/my-pets/${firstPet.id}`);

  return (
    <div className="flex flex-col items-center gap-4">
      <EmptyState
        icon={<PawPrint size={24} />}
        title="No pets yet"
        text="Add your first pet to start tracking meals, walks, vaccines and more."
      />
      <Link href="/my-pets/new" className={buttonClass({ className: "gap-2" })}>
        <Plus size={17} aria-hidden="true" />
        Add a pet
      </Link>
    </div>
  );
}

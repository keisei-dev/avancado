// Left column of My Pets: the member's pets and "Add another pet".
// Reads cookies and the database, so it must be inside <Suspense>.

import { redirect } from "next/navigation";
import { getCurrentMember } from "@/lib/auth/member";
import { getMyPets } from "@/lib/pets/queries";
import { PetSidebarLinks } from "./pet-sidebar-links";
import { AddPetButton } from "./pet-form-modal";

export async function PetSidebar() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");
  const pets = await getMyPets(member.id);

  return (
    <aside className="flex shrink-0 flex-col gap-3 rounded-20 border border-line bg-white p-4 shadow-card tablet:w-72 tablet:p-5">
      <h2 className="px-1 text-xs font-semibold tracking-[0.08em] text-muted uppercase">
        Your pets
      </h2>
      <PetSidebarLinks pets={pets} />
      <AddPetButton memberId={member.id} />
    </aside>
  );
}

export function PetSidebarSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex shrink-0 flex-col gap-3 rounded-20 border border-line bg-white p-4 shadow-card tablet:w-72 tablet:p-5"
    >
      <div className="h-4 w-20 rounded-10 bg-ivory" />
      <div className="h-[70px] animate-pulse rounded-16 bg-ivory" />
      <div className="h-[70px] animate-pulse rounded-16 bg-ivory" />
    </div>
  );
}

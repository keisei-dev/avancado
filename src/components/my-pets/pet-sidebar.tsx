// Left column of My Pets: the member's pets and "Add another pet".
// Reads cookies and the database, so it must be inside <Suspense>.

import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { getCurrentMember } from "@/lib/auth/member";
import { getMyPets } from "@/lib/pets/queries";
import { PetSidebarLinks } from "./pet-sidebar-links";

export async function PetSidebar() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");
  const pets = await getMyPets(member.id);

  return (
    <aside className="flex shrink-0 flex-col gap-3 tablet:w-64">
      <h2 className="text-xs font-semibold tracking-wide text-muted uppercase">
        Your pets
      </h2>
      <PetSidebarLinks pets={pets} />
      <Link
        href="/my-pets/new"
        className="flex items-center justify-center gap-2 rounded-16 border-[1.5px] border-dashed border-line-strong p-3 text-sm font-semibold text-olive-dark hover:border-olive hover:bg-sage-faint"
      >
        <Plus size={17} aria-hidden="true" />
        Add another pet
      </Link>
    </aside>
  );
}

export function PetSidebarSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex shrink-0 flex-col gap-3 tablet:w-64"
    >
      <div className="h-4 w-20 rounded-10 bg-ivory" />
      <div className="h-[70px] animate-pulse rounded-16 bg-ivory" />
      <div className="h-[70px] animate-pulse rounded-16 bg-ivory" />
    </div>
  );
}

// Notion flow: My Pets: Add another pet
// Full-page version of the form (direct link, empty state, Sitter Board).

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { PetForm } from "@/components/my-pets/pet-form";
import { getCurrentMember } from "@/lib/auth/member";

export const metadata = { title: "Add a pet" };

export default function NewPetPage() {
  return (
    <section className="flex flex-col gap-4">
      <h1 className="font-display text-2xl font-bold text-brown">Add a pet</h1>
      <Suspense
        fallback={
          <p className="text-sm text-muted" role="status">
            Loading…
          </p>
        }
      >
        <NewPetForm />
      </Suspense>
    </section>
  );
}

async function NewPetForm() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");
  return (
    <div className="rounded-20 border border-line bg-white p-5 shadow-card tablet:p-8">
      <PetForm memberId={member.id} />
    </div>
  );
}

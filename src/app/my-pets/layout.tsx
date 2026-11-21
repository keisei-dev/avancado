import { Suspense } from "react";
import {
  PetSidebar,
  PetSidebarSkeleton,
} from "@/components/my-pets/pet-sidebar";

export default function MyPetsLayout({ children }: LayoutProps<"/my-pets">) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 tablet:gap-8 tablet:p-8">
      <header>
        <p className="text-xs font-semibold tracking-[0.06em] text-olive-dark uppercase">
          Pet care workspace
        </p>
        <h1 className="mt-1 text-[30px] font-display font-bold tracking-[-0.02em] leading-[1.2] text-brown mb-2">
          My pets
        </h1>
        <p className="mt-1 text-[15px] text-muted">
          Keep every detail a sitter needs in one place.
        </p>
      </header>

      <div className="flex flex-col gap-6 tablet:flex-row tablet:items-start">
        <Suspense fallback={<PetSidebarSkeleton />}>
          <PetSidebar />
        </Suspense>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </main>
  );
}

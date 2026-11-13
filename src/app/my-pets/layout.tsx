import { Suspense } from "react";
import {
  PetSidebar,
  PetSidebarSkeleton,
} from "@/components/my-pets/pet-sidebar";

export default function MyPetsLayout({ children }: LayoutProps<"/my-pets">) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 p-4 tablet:flex-row tablet:p-8">
      <Suspense fallback={<PetSidebarSkeleton />}>
        <PetSidebar />
      </Suspense>
      <div className="min-w-0 flex-1">{children}</div>
    </main>
  );
}

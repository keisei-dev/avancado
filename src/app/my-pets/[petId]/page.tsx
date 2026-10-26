// Notion flow: Pet detail and health data log
// TODO: implement

import { Suspense } from "react";

export default function PetDetailPage({
  params,
}: PageProps<"/my-pets/[petId]">) {
  return (
    <main className="flex flex-1 flex-col gap-2 p-8">
      <h1 className="text-2xl font-bold">Pet Detail</h1>
      <Suspense fallback={<p>Loading…</p>}>
        {params.then(({ petId }) => (
          <p>Pet ID: {petId}</p>
        ))}
      </Suspense>
    </main>
  );
}

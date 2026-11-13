// Notion flow: My Pets: Add/edit health data log
// TODO: implement

import { Suspense } from "react";

export default function PetHealthLogsPage({
  params,
}: PageProps<"/my-pets/[petId]/logs">) {
  return (
    <section className="flex flex-col gap-2">
      <h1 className="text-2xl font-bold">Health Data Log</h1>
      <Suspense fallback={<p>Loading…</p>}>
        {params.then(({ petId }) => (
          <p>Pet ID: {petId}</p>
        ))}
      </Suspense>
    </section>
  );
}

// Notion flow: Map: Review place, Report place
// TODO: implement

import { Suspense } from "react";

export default function PlaceDetailPage({
  params,
}: PageProps<"/map/[placeId]">) {
  return (
    <main className="flex flex-1 flex-col gap-2 p-8">
      <h1 className="text-2xl font-bold">Place Detail</h1>
      <Suspense fallback={<p>Loading…</p>}>
        {params.then(({ placeId }) => (
          <p>Place ID: {placeId}</p>
        ))}
      </Suspense>
    </main>
  );
}

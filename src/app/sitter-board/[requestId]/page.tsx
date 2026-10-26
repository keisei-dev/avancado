// Notion flow: Request detail, Apply to help sit a pet
// TODO: implement

import { Suspense } from "react";

export default function SitterRequestDetailPage({
  params,
}: PageProps<"/sitter-board/[requestId]">) {
  return (
    <main className="flex flex-1 flex-col gap-2 p-8">
      <h1 className="text-2xl font-bold">Sitter Request Detail</h1>
      <Suspense fallback={<p>Loading…</p>}>
        {params.then(({ requestId }) => (
          <p>Request ID: {requestId}</p>
        ))}
      </Suspense>
    </main>
  );
}

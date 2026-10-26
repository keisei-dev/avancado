// Notion flow: View applicants and confirm sitter, Cancel sitter, Mark sitting done and review, Delete my request
// TODO: implement

import { Suspense } from "react";

export default function MySitterRequestDetailPage({
  params,
}: PageProps<"/sitter-board/my-requests/[requestId]">) {
  return (
    <main className="flex flex-1 flex-col gap-2 p-8">
      <h1 className="text-2xl font-bold">Manage Sitter Request</h1>
      <Suspense fallback={<p>Loading…</p>}>
        {params.then(({ requestId }) => (
          <p>Request ID: {requestId}</p>
        ))}
      </Suspense>
    </main>
  );
}

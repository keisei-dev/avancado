// Notion flow: Post detail, React, Report, Mark pet found
// TODO: implement

import { Suspense } from "react";

export default function PostDetailPage({
  params,
}: PageProps<"/community/[postId]">) {
  return (
    <main className="flex flex-1 flex-col gap-2 p-8">
      <h1 className="text-2xl font-bold">Post Detail</h1>
      <Suspense fallback={<p>Loading…</p>}>
        {params.then(({ postId }) => (
          <p>Post ID: {postId}</p>
        ))}
      </Suspense>
    </main>
  );
}

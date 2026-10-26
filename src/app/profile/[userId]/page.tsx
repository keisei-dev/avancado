// Notion flow: Profile: View public profile
// TODO: implement

import { Suspense } from "react";

export default function PublicProfilePage({
  params,
}: PageProps<"/profile/[userId]">) {
  return (
    <main className="flex flex-1 flex-col gap-2 p-8">
      <h1 className="text-2xl font-bold">Public Profile</h1>
      <Suspense fallback={<p>Loading…</p>}>
        {params.then(({ userId }) => (
          <p>User ID: {userId}</p>
        ))}
      </Suspense>
    </main>
  );
}

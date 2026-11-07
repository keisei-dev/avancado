"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CommunityError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto w-full max-w-2xl space-y-4 p-8">
      <h1 className="text-2xl font-bold">Community is unavailable</h1>
      <p className="text-sm text-muted">
        We could not load this page. Please try again.
      </p>
      <Button onClick={reset}>Try again</Button>
      <Link href="/community" className="ml-4 text-sm text-olive-dark">
        Back to community
      </Link>
    </main>
  );
}

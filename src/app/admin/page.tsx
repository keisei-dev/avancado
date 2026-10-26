// Notion flow: Admin: Log in and Dashboard
// TODO: implement

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
};

export default function AdminPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      <h1 className="text-3xl font-bold tracking-tight">Admin</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Admin dashboard coming soon.
      </p>
    </main>
  );
}

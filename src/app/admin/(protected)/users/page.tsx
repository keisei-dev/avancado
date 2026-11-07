// Notion flow: Admin: Manage users

import type { Metadata } from "next";
import { Suspense } from "react";
import { UsersBoard } from "@/components/admin/users-board";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminUserList, parseAdminUserFilter } from "@/lib/admin/users";

export const metadata: Metadata = {
  title: "User Management",
};

export default function AdminUsersPage(props: PageProps<"/admin/users">) {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Loading users…</p>}>
      <UsersContent {...props} />
    </Suspense>
  );
}

async function UsersContent({ searchParams }: PageProps<"/admin/users">) {
  const [admin, query] = await Promise.all([requireAdmin(), searchParams]);
  const list = await getAdminUserList(query);
  const q = (Array.isArray(query.q) ? query.q[0] : query.q)?.trim() ?? "";
  const filter = parseAdminUserFilter(
    Array.isArray(query.filter) ? query.filter[0] : query.filter,
  );

  return (
    <UsersBoard list={list} currentAdminId={admin.id} q={q} filter={filter} />
  );
}

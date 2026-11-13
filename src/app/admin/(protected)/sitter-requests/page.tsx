// Notion flow: Admin: Sitter Request

import type { Metadata } from "next";
import { Suspense } from "react";
import { SitterRequestsBoard } from "@/components/admin/sitter-requests-board";
import { requireAdmin } from "@/lib/auth/admin";
import {
  getAdminSitterRequestList,
  parseAdminSitterFilter,
  parseAdminSitterRange,
} from "@/lib/admin/sitter-requests";

export const metadata: Metadata = {
  title: "Sitter Requests",
};

export default function AdminSitterRequestsPage(
  props: PageProps<"/admin/sitter-requests">,
) {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Loading requests…</p>}>
      <SitterRequestsContent {...props} />
    </Suspense>
  );
}

async function SitterRequestsContent({
  searchParams,
}: PageProps<"/admin/sitter-requests">) {
  const [, query] = await Promise.all([requireAdmin(), searchParams]);
  const list = await getAdminSitterRequestList(query);
  const q = (Array.isArray(query.q) ? query.q[0] : query.q)?.trim() ?? "";
  const filter = parseAdminSitterFilter(
    Array.isArray(query.filter) ? query.filter[0] : query.filter,
  );
  const range = parseAdminSitterRange(
    Array.isArray(query.range) ? query.range[0] : query.range,
  );

  return <SitterRequestsBoard list={list} q={q} filter={filter} range={range} />;
}

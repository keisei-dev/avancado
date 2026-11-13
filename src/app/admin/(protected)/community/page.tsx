// Notion flow: Admin: Community

import type { Metadata } from "next";
import { Suspense } from "react";
import { CommunityBoard } from "@/components/admin/community-board";
import { requireAdmin } from "@/lib/auth/admin";
import {
  getAdminCommunityList,
  parseAdminCommunityFilter,
  parseAdminCommunityRange,
} from "@/lib/admin/community";

export const metadata: Metadata = {
  title: "Community Moderation",
};

export default function AdminCommunityPage(
  props: PageProps<"/admin/community">,
) {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Loading posts…</p>}>
      <CommunityContent {...props} />
    </Suspense>
  );
}

async function CommunityContent({
  searchParams,
}: PageProps<"/admin/community">) {
  const [, query] = await Promise.all([requireAdmin(), searchParams]);
  const list = await getAdminCommunityList(query);
  const q = (Array.isArray(query.q) ? query.q[0] : query.q)?.trim() ?? "";
  const filter = parseAdminCommunityFilter(
    Array.isArray(query.filter) ? query.filter[0] : query.filter,
  );
  const range = parseAdminCommunityRange(
    Array.isArray(query.range) ? query.range[0] : query.range,
  );

  return <CommunityBoard list={list} q={q} filter={filter} range={range} />;
}

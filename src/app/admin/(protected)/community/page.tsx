// Notion flow: Admin: Community

import type { Metadata } from "next";
import { Suspense } from "react";
import { CommunityBoard } from "@/components/admin/community-board";
import { requireAdmin } from "@/lib/auth/admin";
import {
  getAdminCommunityList,
  parseAdminCommunityFilter,
} from "@/lib/admin/community";
import { resolveAdminRange } from "@/lib/admin/date-range";

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
  const { range, from, to } = resolveAdminRange(query);

  return (
    <CommunityBoard
      list={list}
      q={q}
      filter={filter}
      range={range}
      from={from}
      to={to}
    />
  );
}

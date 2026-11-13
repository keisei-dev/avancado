// Notion flow: Admin: Log in and Dashboard
// TODO: implement

import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminGreeting } from "@/components/admin/greeting";
import { PostingChart } from "@/components/admin/posting-chart";
import { ReviewQueue } from "@/components/admin/review-queue";
import { StatCard } from "@/components/admin/stat-card";
import { getDashboardData } from "@/lib/admin/dashboard";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = {
  title: "Admin",
};

export default function AdminDashboardPage(props: PageProps<"/admin">) {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
      <DashboardContent {...props} />
    </Suspense>
  );
}

async function DashboardContent({ searchParams }: PageProps<"/admin">) {
  const [admin, query] = await Promise.all([requireAdmin(), searchParams]);
  const { stats, postingTimes, reviewQueue, periodLabel, range, from, to } =
    await getDashboardData(query);

  const openCount = reviewQueue.filter(
    (item) => item.target !== "verification",
  ).length;

  return (
    <div>
      <AdminGreeting
        displayName={admin.displayName}
        range={range}
        from={from}
        to={to}
      />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.metrics.map((metric) => (
          <StatCard
            key={metric.key}
            metricKey={metric.key}
            label={metric.label}
            value={metric.value}
            hint={metric.hint}
          />
        ))}
      </div>
      <div className="mt-5 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <PostingChart buckets={postingTimes} periodLabel={periodLabel} />
        <ReviewQueue items={reviewQueue} openCount={openCount} />
      </div>
    </div>
  );
}

// Notion flow: Admin: Log in and Dashboard
// TODO: implement

import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminGreeting } from "@/components/admin/greeting";
import { PostingChart } from "@/components/admin/posting-chart";
import { ReviewQueue } from "@/components/admin/review-queue";
import { StatCard } from "@/components/admin/stat-card";
import {
  getDashboardStats,
  getPostingTimes,
  getReviewQueue,
} from "@/lib/admin/mock-data";
import { requireAdmin } from "@/lib/auth/admin";

export const metadata: Metadata = {
  title: "Admin",
};

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  const [admin, stats, postingTimes, reviewQueue] = await Promise.all([
    requireAdmin(),
    getDashboardStats(),
    getPostingTimes(),
    getReviewQueue(),
  ]);

  const openCount = reviewQueue.filter(
    (item) => item.target !== "verification",
  ).length;

  return (
    <div>
      <AdminGreeting displayName={admin.displayName} />
      <p className="mt-1 text-sm text-muted">
        Here is what is happening across Avancado today.
      </p>
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
        <PostingChart buckets={postingTimes} />
        <ReviewQueue items={reviewQueue} openCount={openCount} />
      </div>
    </div>
  );
}

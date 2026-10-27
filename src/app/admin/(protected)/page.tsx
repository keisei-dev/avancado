// Notion flow: Admin: Log in and Dashboard
// TODO: implement

import type { Metadata } from "next";
import { StatCard } from "@/components/admin/stat-card";
import { getDashboardStats } from "@/lib/admin/mock-data";

export const metadata: Metadata = {
  title: "Admin",
};

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div>
      <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-sky-600">
        Overview
      </p>
      <h1 className="mt-1 text-[28px] font-bold tracking-tight text-slate-900">
        Dashboard
      </h1>
      <p className="mt-1 text-sm text-slate-500">
        What is happening across Avancado today.
      </p>
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="総ユーザー数"
          value={stats.totalUsers}
          hint="Registered members"
        />
        <StatCard
          label="未対応の通報"
          value={stats.openReports}
          hint="Needs review"
        />
        <StatCard
          label="本人確認の申請待ち"
          value={stats.pendingVerifications}
          hint="Waiting for approval"
        />
        <StatCard
          label="シッター依頼の件数"
          value={stats.sitterRequests}
          hint="Open requests"
        />
      </div>
    </div>
  );
}

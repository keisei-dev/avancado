// Notion flow: Admin: Log in and Dashboard
// TODO: implement

import { Suspense } from "react";
import { AdminHeader } from "@/components/admin/header";
import { AdminSidebar } from "@/components/admin/sidebar";
import { requireAdmin } from "@/lib/auth/admin";

export default function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<AdminShellFallback />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}

async function AdminShell({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  return (
    <div className="min-h-full bg-slate-50">
      <AdminSidebar />
      <div className="md:ml-64">
        <AdminHeader email={admin.email} />
        <div className="mx-auto max-w-[1450px] px-4 py-8 md:px-8">
          {children}
        </div>
      </div>
    </div>
  );
}

function AdminShellFallback() {
  return (
    <div className="min-h-full bg-slate-50">
      <div className="hidden bg-slate-900 md:fixed md:inset-y-0 md:left-0 md:block md:w-64" />
      <div className="md:ml-64">
        <div className="h-[72px] border-b border-slate-200 bg-white" />
        <div className="px-8 py-8 text-sm text-slate-500">Loading…</div>
      </div>
    </div>
  );
}

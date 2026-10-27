// Notion flow: Admin: Log in and Dashboard
// TODO: implement

import { Suspense } from "react";
import { AdminShellFrame } from "@/components/admin/shell";
import { getAdminNavCounts } from "@/lib/admin/mock-data";
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
  const counts = await getAdminNavCounts();

  return (
    <AdminShellFrame
      displayName={admin.displayName}
      initials={admin.initials}
      counts={counts}
    >
      <div className="mx-auto max-w-[1280px] px-4 py-5 md:px-8 md:py-8">
        {children}
      </div>
    </AdminShellFrame>
  );
}

function AdminShellFallback() {
  return (
    <div className="min-h-full bg-ivory md:grid md:grid-cols-[264px_minmax(0,1fr)]">
      <div className="hidden bg-sidebar md:block" />
      <div>
        <div className="h-16 border-b border-line bg-ivory/88" />
        <div className="px-8 py-8 text-sm text-muted">Loading…</div>
      </div>
    </div>
  );
}

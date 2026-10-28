"use client";

import { useState } from "react";
import { AdminHeader } from "@/components/admin/header";
import { AdminSidebar } from "@/components/admin/sidebar";
import type { AdminNavCounts } from "@/lib/admin/mock-data";

type AdminShellFrameProps = {
  displayName: string;
  initials: string;
  counts: AdminNavCounts;
  children: React.ReactNode;
};

export function AdminShellFrame({
  displayName,
  initials,
  counts,
  children,
}: AdminShellFrameProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-full bg-ivory font-admin text-brown md:grid md:grid-cols-[264px_minmax(0,1fr)]">
      <AdminSidebar
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        displayName={displayName}
        initials={initials}
        counts={counts}
      />
      <div className="min-w-0">
        <AdminHeader
          displayName={displayName}
          initials={initials}
          onOpenMenu={() => setMenuOpen(true)}
        />
        {children}
      </div>
    </div>
  );
}

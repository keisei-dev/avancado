"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { logoutAdmin } from "@/app/admin/login/actions";
import { BrandMark } from "@/components/admin/brand-mark";
import { ADMIN_NAV, isAdminNavActive } from "@/components/admin/nav";
import type { AdminNavCounts } from "@/lib/admin/mock-data";

type AdminSidebarProps = {
  open: boolean;
  onClose: () => void;
  displayName: string;
  initials: string;
  counts: AdminNavCounts;
};

export function AdminSidebar({
  open,
  onClose,
  displayName,
  initials,
  counts,
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      <button
        type="button"
        aria-hidden={!open}
        tabIndex={open ? 0 : -1}
        className={`fixed inset-0 z-40 bg-brown/40 transition-opacity md:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col bg-sidebar px-3.5 py-5 text-white transition-transform duration-200 md:sticky md:top-0 md:z-auto md:h-dvh md:translate-x-0 ${
          open
            ? "translate-x-0 shadow-lg"
            : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="mb-3.5 flex items-center gap-2.5 border-b border-white/10 px-2.5 pb-5">
          <BrandMark size="sm" />
          <div>
            <p className="font-display text-[22px] font-bold tracking-tight text-white">
              Avancado
            </p>
            <p className="mt-1 text-[11px] font-semibold tracking-[0.12em] text-sage uppercase">
              Admin Console
            </p>
          </div>
        </div>
        <nav className="grid gap-0.5">
          {ADMIN_NAV.map((item) => {
            const active = isAdminNavActive(pathname, item.href);
            const Icon = item.icon;
            const count = item.countKey ? counts[item.countKey] : 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-12 px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                  active
                    ? "bg-sage-soft/14 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon aria-hidden="true" size={19} />
                <span className="flex-1">{item.label}</span>
                {count ? (
                  <b className="grid h-5 min-w-5 place-items-center rounded-full bg-coral px-1.5 text-[11px] font-semibold text-white">
                    {count}
                  </b>
                ) : null}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto grid gap-2.5">
          <div className="flex items-center gap-2.5 rounded-12 bg-white/10 px-3 py-3">
            <span className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full bg-sage text-xs font-bold text-olive-hover">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold">
                {displayName}
              </p>
              <p className="text-xs text-white/55">Administrator</p>
            </div>
            <form action={logoutAdmin}>
              <button
                type="submit"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-10 text-white/70 hover:bg-white/10 hover:text-white"
                aria-label="Log out"
              >
                <LogOut aria-hidden="true" size={16} />
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}

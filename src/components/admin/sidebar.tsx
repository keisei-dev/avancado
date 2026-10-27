"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV, isAdminNavActive } from "@/components/admin/nav";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full flex-col bg-slate-900 text-white md:fixed md:inset-y-0 md:left-0 md:w-64">
      <div className="border-b border-slate-700 px-5 py-6">
        <p className="text-lg font-bold tracking-tight">Avancado</p>
        <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Admin Console
        </p>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 py-3 md:flex-1 md:flex-col md:overflow-visible">
        {ADMIN_NAV.map((item) => {
          const active = isAdminNavActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-slate-800 text-white shadow-[inset_3px_0_0_#38bdf8]"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

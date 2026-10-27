"use client";

import { usePathname } from "next/navigation";
import { logoutAdmin } from "@/app/admin/login/actions";
import { ADMIN_NAV } from "@/components/admin/nav";

type AdminHeaderProps = {
  email: string;
};

function titleForPath(pathname: string): string {
  const match = [...ADMIN_NAV]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) =>
      item.href === "/admin"
        ? pathname === "/admin"
        : pathname.startsWith(item.href),
    );
  return match?.label ?? "Admin";
}

export function AdminHeader({ email }: AdminHeaderProps) {
  const pathname = usePathname();

  return (
    <header className="flex h-[72px] items-center justify-between border-b border-slate-200 bg-white px-4 md:px-7">
      <div>
        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
          Avancado / Admin
        </p>
        <p className="text-sm font-semibold text-slate-700">
          {titleForPath(pathname)}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {email ? (
          <p className="hidden max-w-[200px] truncate text-xs text-slate-500 sm:block">
            {email}
          </p>
        ) : null}
        <form action={logoutAdmin}>
          <button
            type="submit"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Log out
          </button>
        </form>
      </div>
    </header>
  );
}

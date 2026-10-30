"use client";

import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { titleForAdminPath } from "@/components/admin/nav";

type AdminHeaderProps = {
  displayName: string;
  initials: string;
  onOpenMenu: () => void;
};

export function AdminHeader({
  displayName,
  initials,
  onOpenMenu,
}: AdminHeaderProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line bg-ivory/88 px-4 backdrop-blur-md md:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMenu}
          className="grid h-10 w-10 place-items-center rounded-12 border border-line bg-white text-brown md:hidden"
          aria-label="Open admin menu"
        >
          <Menu aria-hidden="true" size={18} />
        </button>
        <div>
          <p className="text-[12px] font-medium text-muted">Avancado / Admin</p>
          <p className="font-display text-sm font-semibold text-brown">
            {titleForAdminPath(pathname)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2.5">
        <span className="grid h-[34px] w-[34px] place-items-center rounded-full bg-sage text-xs font-bold text-olive-hover">
          {initials}
        </span>
        <div className="hidden sm:block">
          <p className="text-[13px] font-semibold text-brown">{displayName}</p>
          <p className="text-[12px] text-muted">Administrator</p>
        </div>
      </div>
    </header>
  );
}

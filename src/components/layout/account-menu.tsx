"use client";

// UI library (P2): AccountMenu
/**
 * Avatar button in the top bar that opens: View profile, My pets,
 * Account settings, Admin dashboard (admins only), Log out.
 * Closes on outside click, Escape, or picking an item.
 * On phones only the avatar shows (name and arrow are hidden).
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  PawPrint,
  Settings,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/avatar";

export type AccountMenuUser = {
  name: string;
  email: string;
  avatarUrl?: string | null;
  verified?: boolean;
  isAdmin?: boolean;
};

export type AccountMenuProps = {
  user: AccountMenuUser;
  /** Server action that signs the member out. Passed in by whoever owns auth. */
  logoutAction?: () => void | Promise<void>;
};

const ITEM =
  "flex w-full items-center gap-2.5 rounded-10 p-2.5 text-left text-sm font-medium text-brown transition-colors hover:bg-ivory focus-visible:bg-ivory focus-visible:outline-none";

export function AccountMenu({ user, logoutAction }: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const onProfile = pathname.startsWith("/profile/me");

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (!wrap.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);
  const firstName = user.name.split(" ")[0];

  return (
    <div ref={wrap} className="relative ml-1">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Account menu for ${user.name}`}
        className={cn(
          "flex items-center gap-2 rounded-full border border-line bg-white p-0.5 text-sm font-semibold text-brown transition",
          "hover:border-line-strong hover:shadow-admin focus-visible:shadow-focus focus-visible:outline-none",
          "tablet:py-[3px] tablet:pr-2.5 tablet:pl-[3px]",
          (open || onProfile) && "border-line-strong shadow-admin",
        )}
      >
        <Avatar
          name={user.name}
          src={user.avatarUrl}
          verified={user.verified}
          size="sm"
        />
        <span className="hidden tablet:inline">{firstName}</span>
        <ChevronDown
          size={16}
          aria-hidden="true"
          className={cn(
            "hidden text-muted transition-transform tablet:block",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-[calc(100%+8px)] right-0 z-60 w-[260px] origin-top-right animate-pop-in rounded-16 border border-line bg-white p-1.5 shadow-overlay"
        >
          <div className="mb-1 flex items-center gap-2.5 border-b border-line px-2.5 pt-2.5 pb-3">
            <Avatar name={user.name} src={user.avatarUrl} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-brown">
                {user.name}
              </p>
              <p className="truncate text-xs text-muted">{user.email}</p>
            </div>
          </div>
          <Link
            role="menuitem"
            href="/profile/me"
            onClick={close}
            className={ITEM}
          >
            <UserRound size={17} className="text-muted" aria-hidden="true" />
            View profile
          </Link>
          <Link
            role="menuitem"
            href="/my-pets"
            onClick={close}
            className={ITEM}
          >
            <PawPrint size={17} className="text-muted" aria-hidden="true" />
            My pets
          </Link>
          <Link
            role="menuitem"
            href="/profile/me/settings"
            onClick={close}
            className={ITEM}
          >
            <Settings size={17} className="text-muted" aria-hidden="true" />
            Account settings
          </Link>
          {user.isAdmin ? (
            <Link
              role="menuitem"
              href="/admin"
              onClick={close}
              className={ITEM}
            >
              <LayoutDashboard
                size={17}
                className="text-muted"
                aria-hidden="true"
              />
              Admin dashboard
            </Link>
          ) : null}
          <hr className="my-1 border-line" />
          <form action={logoutAction}>
            <button
              type={logoutAction ? "submit" : "button"}
              role="menuitem"
              onClick={logoutAction ? undefined : close}
              className={cn(ITEM, "text-coral")}
            >
              <LogOut size={17} aria-hidden="true" />
              Log out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

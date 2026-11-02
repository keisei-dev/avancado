"use client";

// UI library (P2): TopBar
/**
 * Sticky bar above every member page.
 * - Logged in: Messages (with unread count), NotificationsMenu, AccountMenu
 * - Guest: Log in / Sign up
 * The logo shows on phones only (the SideNav already has it on bigger screens).
 * Pure UI: the auth owner passes `user`, `unreadMessages`, `notifications`
 * and the server actions.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";
import { buttonClass } from "@/components/ui/button";
import { BrandLogo } from "@/components/layout/brand-logo";
import {
  AccountMenu,
  type AccountMenuUser,
} from "@/components/layout/account-menu";
import {
  NotificationsMenu,
  type NotificationItem,
} from "@/components/layout/notifications-menu";

export type TopBarProps = {
  /** null = guest. */
  user: AccountMenuUser | null;
  unreadMessages?: number;
  notifications?: NotificationItem[];
  markAllReadAction?: () => void | Promise<void>;
  logoutAction?: () => void | Promise<void>;
};

export function TopBar({
  user,
  unreadMessages = 0,
  notifications = [],
  markAllReadAction,
  logoutAction,
}: TopBarProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ivory/88 backdrop-blur-md backdrop-saturate-150">
      <div className="flex h-16 items-center justify-between gap-4 px-4 tablet:px-7">
        <Link
          href="/"
          aria-label="Avancado home"
          className="rounded-12 focus-visible:shadow-focus focus-visible:outline-none tablet:invisible"
        >
          <BrandLogo />
        </Link>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <HeaderIconLink
                href="/messages"
                label="Messages"
                icon={MessageCircle}
                count={unreadMessages}
                active={pathname.startsWith("/messages")}
              />
              <NotificationsMenu
                notifications={notifications}
                onMarkAllRead={markAllReadAction}
              />
              <AccountMenu user={user} logoutAction={logoutAction} />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-3 py-2 text-sm font-semibold text-brown-2 transition-colors hover:bg-cream hover:text-brown focus-visible:shadow-focus focus-visible:outline-none"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className={buttonClass({ className: "min-h-10" })}
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function HeaderIconLink({
  href,
  label,
  icon: Icon,
  count,
  active,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  count: number;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      title={label}
      aria-label={count ? `${label}, ${count} unread` : label}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative grid size-10 place-items-center rounded-12 border border-line bg-white text-brown-2 transition-colors",
        "hover:border-line-strong hover:text-brown focus-visible:shadow-focus focus-visible:outline-none",
        active && "border-sage bg-sage-soft text-olive-dark",
      )}
    >
      <Icon size={19} aria-hidden="true" />
      {count > 0 && (
        <span className="absolute -top-[5px] -right-[5px] grid h-[18px] min-w-[18px] place-items-center rounded-full border-2 border-ivory bg-coral px-[5px] text-[10px] font-bold text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}

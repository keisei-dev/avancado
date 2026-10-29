"use client";

/**
 * Messages, notifications (unread dot) and avatar menu when logged in;
 * Log in / Sign up for guests.
 */

import Link from "next/link";
import { Bell, MessageCircle, UserCircle } from "lucide-react";
import { BrandMark } from "@/components/admin/brand-mark";

export function TopBar() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex min-h-16 items-center justify-between px-4 sm:px-6">
        <Link className="flex items-center" href="/" aria-label="Avancado home">
          <BrandMark size="sm" />
        </Link>
        <div className="flex items-center gap-2">
          <Link className="rounded-md p-2 text-zinc-700 hover:bg-zinc-100" href="/messages" aria-label="Messages" title="Messages">
            <MessageCircle size={19} />
          </Link>
          <Link className="rounded-md p-2 text-zinc-700 hover:bg-zinc-100" href="/notifications" aria-label="Notifications" title="Notifications">
            <Bell size={19} />
          </Link>
          <Link className="rounded-md p-2 text-zinc-700 hover:bg-zinc-100" href="/profile/me" aria-label="Profile" title="Profile">
            <UserCircle size={19} />
          </Link>
          <div className="ml-2 flex items-center gap-2">
            <Link className="inline-flex min-h-11 items-center justify-center gap-2
    rounded-full px-5 text-sm font-semibold
    border border-transparent
    bg-transparent
    hover:bg-[var(--cream)]
    text-[var(--brown-dark)] hover:text-[var(--brown-dark-hover)]
" href="/login">
              Log in
            </Link>
            <Link className="inline-flex min-h-11 items-center justify-center gap-2
    rounded-full px-5 text-sm font-semibold
    border border-transparent
    bg-[var(--olive-deep)] text-white
    hover:bg-[var(--olive-deep-hover)]
" href="/signup">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

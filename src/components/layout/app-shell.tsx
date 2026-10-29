"use client";

// UI library (P2): AppShell
/**
 * The member frame: SideNav | (TopBar + page), plus MobileTabBar on phones.
 * Admin, login, signup and /dev pages render without it.
 * Pages render their own <main>; the shell only adds the frame.
 * TopBar is passed in from the root layout so the server can fill in the user.
 */

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SideNav } from "@/components/layout/side-nav";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";

const NO_SHELL = ["/admin", "/login", "/signup", "/dev"];

export function AppShell({
  topBar,
  children,
}: {
  topBar: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const bare = NO_SHELL.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
  if (bare) return <>{children}</>;

  return (
    <div className="grid min-h-screen flex-1 bg-ivory tablet:grid-cols-[80px_minmax(0,1fr)] wide:grid-cols-[252px_minmax(0,1fr)]">
      <SideNav />
      <div className="flex min-w-0 flex-col">
        {topBar}
        {/* Each page renders its own main element. `isolate` keeps map layers (Leaflet) under the bars. */}
        <div className="isolate flex flex-1 flex-col pb-24 tablet:pb-0">
          {children}
        </div>
      </div>
      <MobileTabBar />
    </div>
  );
}

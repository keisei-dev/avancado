"use client";

// UI library (P2): MobileTabBar
/**
 * Bottom tabs on phones (<900px), same 5 pages as SideNav.
 * The page content needs bottom padding (pb-24) so the bar doesn't cover it;
 * AppShell already adds it.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { NAV_ITEMS, isNavActive } from "@/components/layout/nav-items";

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-line bg-white/95 px-1.5 pt-1.5 pb-[max(8px,env(safe-area-inset-bottom))] backdrop-blur-lg tablet:hidden"
    >
      {NAV_ITEMS.map((item) => {
        const active = isNavActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "grid justify-items-center gap-[3px] rounded-12 py-1.5 text-[11px] font-medium text-muted transition-colors",
              "focus-visible:shadow-focus focus-visible:outline-none",
              active && "font-semibold text-olive-dark",
            )}
          >
            <Icon
              size={20}
              strokeWidth={active ? 2.4 : 2}
              className={active ? "text-olive" : undefined}
              aria-hidden="true"
            />
            {item.shortLabel}
          </Link>
        );
      })}
    </nav>
  );
}

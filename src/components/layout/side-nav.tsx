"use client";

// UI library (P2): SideNav
/**
 * Desktop left menu: logo, the 5 main pages, and Terms / Safety / Privacy.
 * - wide (≥1240px): 252px with labels
 * - tablet (900–1239px): 80px, icons only (label in a tooltip)
 * - phone (<900px): hidden; MobileTabBar takes over
 * Needs "use client" for usePathname (active item).
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { BrandLogo } from "@/components/layout/brand-logo";
import {
  LEGAL_LINKS,
  NAV_ITEMS,
  isNavActive,
} from "@/components/layout/nav-items";

export function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 z-40 hidden h-screen flex-col gap-[18px] border-r border-line bg-white/50 px-2.5 py-5 tablet:flex wide:px-3.5 wide:pt-[22px] wide:pb-[18px]">
      <Link
        href="/"
        aria-label="Avancado home"
        className="self-center rounded-12 pt-1 pb-3 focus-visible:shadow-focus focus-visible:outline-none wide:self-start wide:px-2.5"
      >
        <BrandLogo nameClassName="hidden wide:inline" />
      </Link>

      <nav aria-label="Main">
        <ul className="grid gap-0.5">
          {NAV_ITEMS.map((item) => {
            const active = isNavActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  title={item.label}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center justify-center gap-3.5 rounded-12 p-2.5 text-[15px] font-medium text-brown-2 transition-colors",
                    "hover:bg-cream hover:text-brown focus-visible:shadow-focus focus-visible:outline-none",
                    "wide:justify-start wide:px-3",
                    active &&
                      "bg-white font-bold text-brown shadow-admin hover:bg-white",
                  )}
                >
                  <span className="grid size-7 shrink-0 place-items-center">
                    <Icon
                      size={21}
                      strokeWidth={active ? 2.4 : 2}
                      className={active ? "text-olive" : undefined}
                      aria-hidden="true"
                    />
                  </span>
                  <span className="sr-only wide:not-sr-only">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <nav
        aria-label="Legal"
        className="mt-auto hidden flex-wrap gap-x-3 gap-y-1 px-3 wide:flex"
      >
        {LEGAL_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="text-xs text-muted transition-colors hover:text-brown"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

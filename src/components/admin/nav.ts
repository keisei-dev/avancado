import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  LayoutDashboard,
  MapPin,
  MessagesSquare,
  UserRound,
} from "lucide-react";
import type { AdminNavCounts } from "@/lib/admin/mock-data";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  countKey?: keyof AdminNavCounts;
};

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard Overview", icon: LayoutDashboard },
  {
    href: "/admin/community",
    label: "Community Moderation",
    icon: MessagesSquare,
    countKey: "community",
  },
  {
    href: "/admin/sitter-requests",
    label: "Sitter Requests",
    icon: CalendarDays,
    countKey: "requests",
  },
  {
    href: "/admin/spots",
    label: "Pet-Friendly Spots",
    icon: MapPin,
    countKey: "spots",
  },
  {
    href: "/admin/users",
    label: "User Management",
    icon: UserRound,
    countKey: "users",
  },
];

export function isAdminNavActive(pathname: string, href: string): boolean {
  if (href === "/admin") {
    return pathname === "/admin";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function titleForAdminPath(pathname: string): string {
  const match = [...ADMIN_NAV]
    .sort((a, b) => b.href.length - a.href.length)
    .find((item) =>
      item.href === "/admin"
        ? pathname === "/admin"
        : pathname.startsWith(item.href),
    );
  return match?.label ?? "Admin";
}

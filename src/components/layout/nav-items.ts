import type { LucideIcon } from "lucide-react";
import { Dog, Home, MapPin, PawPrint, UsersRound } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  /** Shorter label for the phone tab bar. */
  shortLabel: string;
  icon: LucideIcon;
};

/** The 5 main destinations. Used by SideNav and MobileTabBar. */
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Home", shortLabel: "Home", icon: Home },
  {
    href: "/community",
    label: "Community",
    shortLabel: "Community",
    icon: UsersRound,
  },
  {
    href: "/sitter-board",
    label: "Sitter board",
    shortLabel: "Sitter",
    icon: Dog,
  },
  { href: "/map", label: "Pet-friendly map", shortLabel: "Map", icon: MapPin },
  { href: "/my-pets", label: "My pets", shortLabel: "My pets", icon: PawPrint },
];

export const LEGAL_LINKS = [
  { href: "/terms", label: "Terms" },
  { href: "/safety", label: "Safety" },
  { href: "/privacy", label: "Privacy" },
  { href: "/admin", label: "Admin" },
];

/** "/community/123" keeps Community active; "/" only matches Home itself. */
export function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

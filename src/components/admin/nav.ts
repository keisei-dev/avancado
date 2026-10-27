export const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/community", label: "Community" },
  { href: "/admin/sitter-requests", label: "Sitter Requests" },
  { href: "/admin/verification", label: "Identity Verification" },
  { href: "/admin/reports", label: "Reports" },
] as const;

export function isAdminNavActive(pathname: string, href: string): boolean {
  if (href === "/admin") {
    return pathname === "/admin";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

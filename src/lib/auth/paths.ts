export const MEMBER_LOGIN_PATH = "/login";
export const ADMIN_LOGIN_PATH = "/admin/login";

export function isAdminProtectedPath(pathname: string): boolean {
  if (!pathname.startsWith("/admin")) {
    return false;
  }
  return (
    pathname !== ADMIN_LOGIN_PATH &&
    !pathname.startsWith(`${ADMIN_LOGIN_PATH}/`)
  );
}

/**
 * Paths an ADMIN may open without being sent to /admin. Proxy sends every
 * other path to /admin when the av_role cookie says admin.
 */
const ADMIN_OUTSIDE_CONSOLE_PREFIXES = [
  "/admin",
  "/login",
  "/signup",
  "/reset-password",
  "/auth",
  "/api",
  "/dev",
] as const;

export function isMemberSitePath(pathname: string): boolean {
  if (!pathname) return false;
  return !ADMIN_OUTSIDE_CONSOLE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

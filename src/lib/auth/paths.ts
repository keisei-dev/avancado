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

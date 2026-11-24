import { NextResponse, type NextRequest } from "next/server";
import { isMemberSitePath } from "@/lib/auth/paths";
import {
  clearRoleCookie,
  writeRoleCookie,
} from "@/lib/auth/role-cookie";
import { getCurrentMember, isAdminMember } from "@/lib/auth/member";

/**
 * Sets av_role from Prisma User.role, then sends admins to /admin and
 * members back to the page they asked for. Proxy calls this when a signed-in
 * session has no role cookie yet. Redirect() in the root layout is not used:
 * that throw is reported as an instant-UI error.
 */
export async function GET(request: NextRequest) {
  const member = await getCurrentMember();
  const destination = member
    ? isAdminMember(member)
      ? "/admin"
      : safeMemberPath(request.nextUrl.searchParams.get("next"))
    : "/login";

  const response = NextResponse.redirect(new URL(destination, request.url));
  response.headers.set("Cache-Control", "private, no-store");
  if (member) writeRoleCookie(response.cookies, isAdminMember(member));
  else clearRoleCookie(response.cookies);
  return response;
}

function safeMemberPath(value: string | null): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  try {
    const url = new URL(value, "http://local");
    if (url.origin !== "http://local" || !isMemberSitePath(url.pathname)) {
      return "/";
    }
    return `${url.pathname}${url.search}`;
  } catch {
    return "/";
  }
}

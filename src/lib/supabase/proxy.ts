import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  isAdminProtectedPath,
  isMemberSitePath,
  MEMBER_LOGIN_PATH,
} from "@/lib/auth/paths";
import {
  ADMIN_ROLE_VALUE,
  MEMBER_ROLE_COOKIE,
  MEMBER_ROLE_VALUE,
} from "@/lib/auth/role-cookie";

/**
 * Refreshes the Supabase Auth session and forwards the updated cookies to both
 * Server Components (via the request) and the browser (via the response).
 * Called from src/proxy.ts on every matched request.
 * Admins are sent to /admin from the av_role cookie. That cookie is written
 * from Prisma User.role at login and by /auth/role. Proxy does not query Prisma.
 */
function nextPass(request: NextRequest) {
  return NextResponse.next({ request });
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = nextPass(request);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Lets the app run locally before .env.local has been filled in.
  if (!supabaseUrl || !supabaseKey) {
    return redirectAdminIfNeeded(request, supabaseResponse, false);
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = nextPass(request);
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
        // Cache-Control/Expires/Pragma: stops CDNs from caching a response
        // that carries one user's session cookie and serving it to others.
        Object.entries(headers).forEach(([key, value]) =>
          supabaseResponse.headers.set(key, value),
        );
      },
    },
  });

  // Do not add code between createServerClient() and getClaims(). getClaims()
  // verifies the token and refreshes it when it is about to expire; without it
  // users get signed out at random.
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims);

  // Return supabaseResponse as-is. If you need a different response (e.g. a
  // redirect), copy supabaseResponse's cookies and cache headers onto it first,
  // otherwise the refreshed session is lost.
  return redirectAdminIfNeeded(request, supabaseResponse, signedIn);
}

function redirectAdminIfNeeded(
  request: NextRequest,
  supabaseResponse: NextResponse,
  signedIn: boolean,
) {
  const pathname = request.nextUrl.pathname;

  if (signedIn && isMemberSitePath(pathname)) {
    const role = request.cookies.get(MEMBER_ROLE_COOKIE)?.value;
    if (role === ADMIN_ROLE_VALUE) {
      return redirectKeepingCookies(request, supabaseResponse, "/admin", "");
    }
    if (role !== MEMBER_ROLE_VALUE) {
      const next = `${pathname}${request.nextUrl.search}`;
      return redirectKeepingCookies(
        request,
        supabaseResponse,
        "/auth/role",
        `next=${encodeURIComponent(next)}`,
      );
    }
  }

  if (signedIn || !isAdminProtectedPath(pathname)) {
    return supabaseResponse;
  }

  return redirectKeepingCookies(request, supabaseResponse, MEMBER_LOGIN_PATH);
}

function redirectKeepingCookies(
  request: NextRequest,
  supabaseResponse: NextResponse,
  pathname: string,
  search?: string,
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  if (search !== undefined) {
    url.search = search;
  }
  const redirectResponse = NextResponse.redirect(url);
  supabaseResponse.cookies.getAll().forEach(({ name, value }) => {
    redirectResponse.cookies.set(name, value);
  });
  for (const header of ["cache-control", "expires", "pragma"]) {
    const value = supabaseResponse.headers.get(header);
    if (value) {
      redirectResponse.headers.set(header, value);
    }
  }
  return redirectResponse;
}

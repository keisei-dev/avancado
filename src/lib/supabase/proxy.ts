import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { MEMBER_LOGIN_PATH, isAdminProtectedPath } from "@/lib/auth/paths";

/**
 * Refreshes the Supabase Auth session and forwards the updated cookies to both
 * Server Components (via the request) and the browser (via the response).
 * Called from src/proxy.ts on every matched request.
 */
/** Forward the pathname so Server Components can gate admins without Prisma in proxy. */
function nextWithPathname(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = nextWithPathname(request);

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
        supabaseResponse = nextWithPathname(request);
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
  if (signedIn || !isAdminProtectedPath(request.nextUrl.pathname)) {
    return supabaseResponse;
  }

  const url = request.nextUrl.clone();
  url.pathname = MEMBER_LOGIN_PATH;
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

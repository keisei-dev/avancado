import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase Auth session and forwards the updated cookies to both
 * Server Components (via the request) and the browser (via the response).
 * Called from src/proxy.ts on every matched request.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Lets the app run locally before .env.local has been filled in.
  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
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
        supabaseResponse = NextResponse.next({ request });
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
  await supabase.auth.getClaims();

  // Return supabaseResponse as-is. If you need a different response (e.g. a
  // redirect), copy supabaseResponse's cookies and cache headers onto it first,
  // otherwise the refreshed session is lost.
  return supabaseResponse;
}

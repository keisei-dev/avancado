import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Next.js 16 renamed middleware.ts to proxy.ts; the behaviour is the same.
// updateSession() also sends unsigned visitors on /admin (except /admin/login)
// to the admin login page.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Run on every path except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico and common image files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

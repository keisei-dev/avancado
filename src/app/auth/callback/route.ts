import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv, hasDatabaseEnv } from "@/lib/auth/admin";
import { provisionMember } from "@/lib/auth/member";

export async function GET(request: NextRequest) {
  const failure = () => {
    const response = NextResponse.redirect(
      new URL("/login?error=auth_link", request.url),
    );
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  };
  const code = request.nextUrl.searchParams.get("code");
  if (!code || !hasSupabaseEnv() || !hasDatabaseEnv()) return failure();
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error || !data.user) return failure();
    try {
      const member = await provisionMember(data.user);
      if (!member || member.accountStatus !== "ACTIVE") {
        await supabase.auth.signOut();
        return failure();
      }
    } catch {
      await supabase.auth.signOut();
      return failure();
    }
    // Only known local destinations are allowed, never a supplied external URL.
    const destination =
      request.nextUrl.searchParams.get("next") === "/reset-password"
        ? "/reset-password"
        : "/";
    const response = NextResponse.redirect(new URL(destination, request.url));
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch {
    return failure();
  }
}

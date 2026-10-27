import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_LOGIN_PATH } from "@/lib/auth/paths";

export { ADMIN_LOGIN_PATH, isAdminProtectedPath } from "@/lib/auth/paths";

type JwtClaims = {
  email?: string;
  sub?: string;
  app_metadata?: {
    role?: string;
    [key: string]: unknown;
  };
};

/**
 * Role check lives here so it can later read Prisma's User table instead of
 * Supabase JWT claims, without changing the rest of the admin UI.
 */
export function isAdmin(claims: JwtClaims | null | undefined): boolean {
  return claims?.app_metadata?.role === "admin";
}

export function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export type AdminUser = {
  id: string;
  email: string;
};

/**
 * Loads the current user from the Supabase server client and redirects to
 * /admin/login unless they are signed in with app_metadata.role === "admin".
 */
export async function requireAdmin(): Promise<AdminUser> {
  if (!hasSupabaseEnv()) {
    redirect(ADMIN_LOGIN_PATH);
  }

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims as JwtClaims | undefined;

  if (!isAdmin(claims)) {
    redirect(ADMIN_LOGIN_PATH);
  }

  return {
    id: claims?.sub ?? "",
    email: claims?.email ?? "",
  };
}

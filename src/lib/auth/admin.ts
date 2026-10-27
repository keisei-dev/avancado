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
  displayName: string;
  initials: string;
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

  const email = claims?.email ?? "";

  return {
    id: claims?.sub ?? "",
    email,
    displayName: displayNameFromEmail(email),
    initials: initialsFromName(displayNameFromEmail(email)),
  };
}

function displayNameFromEmail(email: string): string {
  const local = email.split("@")[0]?.trim() ?? "";
  const parts = local.split(/[._-]+/).filter(Boolean);
  if (parts.length === 0) {
    return "Admin";
  }

  return parts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function initialsFromName(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return "AD";
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

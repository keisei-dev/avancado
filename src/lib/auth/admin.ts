import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_LOGIN_PATH } from "@/lib/auth/paths";

export { ADMIN_LOGIN_PATH, isAdminProtectedPath } from "@/lib/auth/paths";

type AdminRecord = {
  id: string;
  email: string;
  name: string;
};

export function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function hasDatabaseEnv(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export type AdminUser = {
  id: string;
  email: string;
  displayName: string;
  initials: string;
};

/**
 * True when the Prisma User row for this Supabase Auth id has role ADMIN.
 * User.id matches auth.users.id.
 */
export async function isAdmin(userId: string): Promise<boolean> {
  return (await findAdminUser(userId)) !== null;
}

/**
 * Loads the current user from the Supabase server client and redirects to
 * /admin/login unless they are signed in and their Prisma User.role is ADMIN.
 */
export async function requireAdmin(): Promise<AdminUser> {
  if (!hasSupabaseEnv() || !hasDatabaseEnv()) {
    redirect(ADMIN_LOGIN_PATH);
  }

  // Supabase getUser() compares token expiry to Date.now(); wait for the
  // request so Cache Components does not prerender that timestamp.
  await connection();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(ADMIN_LOGIN_PATH);
  }

  const admin = await findAdminUser(user.id);
  if (!admin) {
    redirect(ADMIN_LOGIN_PATH);
  }

  const email = admin.email || user.email || "";
  const displayName = admin.name.trim() || displayNameFromEmail(email);

  return {
    id: admin.id,
    email,
    displayName,
    initials: initialsFromName(displayName),
  };
}

async function findAdminUser(userId: string): Promise<AdminRecord | null> {
  if (!hasDatabaseEnv()) {
    return null;
  }

  const { prisma } = await import("@/lib/prisma/client");
  const { UserRole } = await import("@/generated/prisma/client");

  const row = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, role: true },
  });

  if (!row || row.role !== UserRole.ADMIN) {
    return null;
  }

  return { id: row.id, email: row.email, name: row.name };
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

import "server-only";

import { cache } from "react";
import { connection } from "next/server";
import type { User } from "@supabase/supabase-js";
import { UserRole } from "@/generated/prisma/client";
import { createClient } from "@/lib/supabase/server";
import { hasDatabaseEnv, hasSupabaseEnv } from "@/lib/auth/admin";

export async function findMember(id: string) {
  const { prisma } = await import("@/lib/prisma/client");
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      isVerified: true,
      accountStatus: true,
      role: true,
    },
  });
}

export function isAdminMember(member: { role: UserRole }): boolean {
  return member.role === UserRole.ADMIN;
}

export function memberHomePath(member: { role: UserRole }): string {
  return isAdminMember(member) ? "/admin" : "/";
}

// Create the application profile only after Supabase has authenticated the user.
// Never copy roles, verification flags or account status from user metadata.
export async function provisionMember(user: User) {
  const existing = await findMember(user.id);
  if (existing) return existing;
  const { first_name, last_name, terms_accepted_at } = user.user_metadata;
  if (
    !user.email ||
    !user.email_confirmed_at ||
    typeof first_name !== "string" ||
    !first_name.trim() ||
    typeof last_name !== "string" ||
    !last_name.trim() ||
    typeof terms_accepted_at !== "string" ||
    !Number.isFinite(Date.parse(terms_accepted_at))
  )
    return null;

  const { prisma } = await import("@/lib/prisma/client");
  await prisma.user.upsert({
    where: { id: user.id },
    update: {},
    create: {
      id: user.id,
      email: user.email,
      name: `${first_name.trim()} ${last_name.trim()}`.slice(0, 201),
      termsAcceptedAt: new Date(terms_accepted_at),
    },
  });
  return findMember(user.id);
}

export const getCurrentMember = cache(async () => {
  if (!hasSupabaseEnv() || !hasDatabaseEnv()) return null;
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  const member = await findMember(user.id);
  return member?.accountStatus === "ACTIVE" ? member : null;
});

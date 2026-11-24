import "server-only";

import { createClient } from "@supabase/supabase-js";

/**
 * Deletes the Supabase Auth user whose id matches Prisma User.id.
 * A missing Auth user is treated as already removed. Seed members other than
 * Maya and Admin have no Auth row.
 */
export async function deleteAuthUser(userId: string): Promise<void> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error } = await supabase.auth.admin.deleteUser(userId, false);
  if (!error) return;

  const status = "status" in error ? Number(error.status) : undefined;
  if (status === 404 || /not found/i.test(error.message)) return;
  throw error;
}

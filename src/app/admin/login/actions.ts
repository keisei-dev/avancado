"use server";

import { redirect } from "next/navigation";
import { ADMIN_LOGIN_PATH, hasSupabaseEnv, isAdmin } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

export type LoginState = {
  error: string | null;
};

export async function loginAdmin(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  if (!hasSupabaseEnv()) {
    return {
      error:
        "Supabase is not configured. Copy .env.example to .env.local and add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return {
      error: "The email or password does not match an admin account.",
    };
  }

  const { data } = await supabase.auth.getClaims();
  if (!isAdmin(data?.claims)) {
    await supabase.auth.signOut();
    return {
      error: "The email or password does not match an admin account.",
    };
  }

  redirect("/admin");
}

export async function logoutAdmin() {
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect(ADMIN_LOGIN_PATH);
}

"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { hasDatabaseEnv, hasSupabaseEnv } from "@/lib/auth/admin";
import { isAdminMember, provisionMember } from "@/lib/auth/member";

export type AuthState = {
  error: string | null;
  message?: string;
  email?: string;
};

function configurationError(): AuthState | null {
  return hasSupabaseEnv() && hasDatabaseEnv()
    ? null
    : {
        error: "Sign in is currently unavailable. Please try again later.",
      };
}

function emailFrom(form: FormData) {
  const email = String(form.get("email") ?? "")
    .trim()
    .toLowerCase();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? email
    : null;
}

async function callbackUrl(recovery = false) {
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL || (await headers()).get("origin");
  if (!origin) throw new Error("Missing site origin");
  const url = new URL("/auth/callback", origin);
  if (recovery) url.searchParams.set("next", "/reset-password");
  return url.toString();
}

export async function loginMember(
  _prev: AuthState,
  form: FormData,
): Promise<AuthState> {
  const config = configurationError();
  if (config) return config;
  const email = emailFrom(form);
  const password = String(form.get("password") ?? "");
  if (!email || !password || password.length > 1024)
    return { error: "Enter a valid email address and password." };

  let isAdmin = false;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error || !data.user)
      return {
        error:
          error?.code === "email_not_confirmed"
            ? "Please verify your email before logging in."
            : "The email or password is incorrect. Please try again.",
      };
    try {
      const member = await provisionMember(data.user);
      if (!member || member.accountStatus !== "ACTIVE") {
        await supabase.auth.signOut();
        return {
          error: "This account is unavailable. Please contact support.",
        };
      }
      isAdmin = isAdminMember(member);
    } catch {
      await supabase.auth.signOut();
      return { error: "We couldn’t load your profile. Please try again." };
    }
  } catch {
    return { error: "We couldn’t connect. Please try again." };
  }
  revalidatePath("/", "layout");
  redirect(isAdmin ? "/admin" : "/");
}

export async function signupMember(
  _prev: AuthState,
  form: FormData,
): Promise<AuthState> {
  const config = configurationError();
  if (config) return config;
  const email = emailFrom(form);
  const password = String(form.get("password") ?? "");
  const firstName = String(form.get("firstName") ?? "").trim();
  const lastName = String(form.get("lastName") ?? "").trim();
  if (
    !email ||
    !firstName ||
    !lastName ||
    firstName.length > 100 ||
    lastName.length > 100
  )
    return { error: "Enter your name and a valid email address." };
  if (password.length < 8 || password.length > 1024)
    return { error: "Password must be between 8 and 1,024 characters." };
  if (form.get("consent") !== "on")
    return {
      error: "Please accept the Terms & Conditions and Privacy Policy.",
    };

  let signedIn = false;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: await callbackUrl(),
        data: {
          first_name: firstName,
          last_name: lastName,
          terms_accepted_at: new Date().toISOString(),
        },
      },
    });
    if (error)
      return {
        error:
          error.code === "weak_password"
            ? "Choose a stronger password with a mix of letters, numbers and symbols."
            : "We couldn’t create your account. Try again or log in if you already have an account.",
      };
    if (data.session && data.user) {
      try {
        const member = await provisionMember(data.user);
        signedIn = member?.accountStatus === "ACTIVE";
        if (!signedIn) await supabase.auth.signOut();
      } catch {
        await supabase.auth.signOut();
        return {
          error:
            "Your account was created, but we couldn’t load your profile. Please try logging in.",
        };
      }
    }
  } catch {
    return { error: "We couldn’t connect. Please try again." };
  }
  if (signedIn) {
    revalidatePath("/", "layout");
    redirect("/");
  }
  return { error: null, email, message: "Check your inbox" };
}

export async function sendPasswordReset(
  _prev: AuthState,
  form: FormData,
): Promise<AuthState> {
  const config = configurationError();
  if (config) return config;
  const email = emailFrom(form);
  if (!email) return { error: "Enter a valid email address." };
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: await callbackUrl(true),
    });
    if (error)
      return {
        error: "We couldn’t send a reset link. Please try again later.",
      };
  } catch {
    return { error: "We couldn’t connect. Please try again." };
  }
  return {
    error: null,
    message:
      "If an account exists for this email, we’ve sent a link to reset your password.",
  };
}

export async function resendVerification(
  _prev: AuthState,
  form: FormData,
): Promise<AuthState> {
  const config = configurationError();
  if (config) return config;
  const email = emailFrom(form);
  if (!email) return { error: "Enter a valid email address." };
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: await callbackUrl() },
    });
    if (error)
      return {
        error:
          "We couldn’t resend the email. Please wait a moment and try again.",
      };
  } catch {
    return { error: "We couldn’t connect. Please try again." };
  }
  return {
    error: null,
    message: "If verification is pending, a new email has been sent.",
  };
}

export async function resetPassword(
  _prev: AuthState,
  form: FormData,
): Promise<AuthState> {
  const config = configurationError();
  if (config) return config;
  const password = String(form.get("password") ?? "");
  if (password.length < 8 || password.length > 1024)
    return { error: "Password must be between 8 and 1,024 characters." };
  if (password !== form.get("confirmPassword"))
    return { error: "Passwords do not match." };
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user)
      return {
        error:
          "Your reset link has expired. Request a new link from the login page.",
      };
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { error: "Choose a different password and try again." };
    await supabase.auth.signOut();
  } catch {
    return { error: "We couldn’t update your password. Please try again." };
  }
  revalidatePath("/", "layout");
  return {
    error: null,
    message: "Your password has been updated. You can now log in.",
  };
}

export async function logoutMember() {
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) throw new Error("Could not log out. Please try again.");
  }
  revalidatePath("/", "layout");
  redirect("/login");
}

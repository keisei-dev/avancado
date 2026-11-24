"use server";

import { revalidatePath } from "next/cache";
import { getCurrentMember } from "@/lib/auth/member";
import { prisma } from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";
import { getVerificationStatus } from "@/lib/profile/get-verification-status";

export type SaveState = { error: string; saved: boolean };

export async function updateProfile(
  _previous: SaveState,
  form: FormData,
): Promise<SaveState> {
  const member = await getCurrentMember();
  if (!member) return { error: "Please sign in again.", saved: false };

  const data: Record<string, unknown> = {};

  if (form.has("name")) {
    const name = String(form.get("name")).trim();
    if (!name || name.length > 100)
      return { error: "Enter a name (up to 100 characters).", saved: false };
    data.name = name;
  }
  if (form.has("bio")) {
    const bio = String(form.get("bio")).trim();
    if (bio.length > 300)
      return { error: "Keep About me under 300 characters.", saved: false };
    data.bio = bio || null; // empty box → no bio
  }
  if (form.has("areaName")) {
    data.areaName = String(form.get("areaName")).trim() || null;
  }
  if (form.has("sitting")) {
    data.careSpecies = form
      .getAll("careSpecies")
      .filter((v) => v === "DOG" || v === "CAT");
    const sittingExperience = String(form.get("experience") ?? "").trim();
    if (sittingExperience.length > 1000) {
      return {
        error: "Keep sitting experience under 1000 characters.",
        saved: false,
      };
    }
    data.sittingExperience = sittingExperience || null;
    data.certificateName =
      String(form.get("certificateName") ?? "").trim() || null;
    data.certificateIssuedBy =
      String(form.get("certificateIssuedBy") ?? "").trim() || null;
  }

  await prisma.user.update({ where: { id: member.id }, data });

  revalidatePath("/profile/me");
  return { error: "", saved: true };
}

export async function verifyIdentity(
  _previous: SaveState,
  form: FormData,
): Promise<SaveState> {
  const member = await getCurrentMember();
  if (!member) return { error: "Please sign in again.", saved: false };

  const documentType = String(form.get("documentType") ?? "");
  if (!["BCID", "PASSPORT", "OTHER"].includes(documentType)) {
    return { error: "Select a valid document type.", saved: false };
  }

  const { status } = await getVerificationStatus(member.id, member.isVerified);
  if (status === "pending") {
    return { error: "Your ID is already being reviewed.", saved: false };
  }
  if (status === "verified") {
    return { error: "Your account is already verified.", saved: false };
  }

  await prisma.idVerification.create({
    data: {
      userId: member.id,
      documentType: documentType as "BCID" | "PASSPORT" | "OTHER",
      status: "PENDING",
    },
  });

  revalidatePath("/profile/me");
  return { error: "", saved: true };
}

export async function updatePassword(
  _previous: SaveState,
  form: FormData,
): Promise<SaveState> {
  const member = await getCurrentMember();
  if (!member) return { error: "Please sign in again.", saved: false };

  const currentPassword = String(form.get("currentPassword") ?? "");
  const newPassword = String(form.get("newPassword") ?? "");
  const confirmPassword = String(form.get("confirmPassword") ?? "");

  if (newPassword.length < 8 || newPassword.length > 1024) {
    return { error: "Password must be at least 8 characters.", saved: false };
  }
  if (newPassword !== confirmPassword) {
    return { error: "The new passwords don't match.", saved: false };
  }
  if (newPassword === currentPassword) {
    return { error: "Choose a password you haven't used here.", saved: false };
  }

  const supabase = await createClient();

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: member.email,
    password: currentPassword,
  });
  if (signInError) {
    return { error: "Your current password isn't correct.", saved: false };
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    return {
      error: "Choose a stronger password and try again.",
      saved: false,
    };
  }

  return { error: "", saved: true };
}


export async function deactivateAccount(): Promise<SaveState> {
  const member = await getCurrentMember();
  if (!member) return { error: "Please sign in again.", saved: false };

  await prisma.user.update({
    where: { id: member.id },
    data: { accountStatus: "HIDDEN" },
  });

  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" });

  revalidatePath("/", "layout");
  return { error: "", saved: true };
}

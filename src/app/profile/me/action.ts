"use server";

import { revalidatePath } from "next/cache";
import { getCurrentMember } from "@/lib/auth/member";
import { prisma } from "@/lib/prisma/client";

export type SaveState = { error: string; saved: boolean };

export async function updateProfile(
  _previous: SaveState,
  form: FormData,
): Promise<SaveState> {
  // 1. Only the signed-in member can change their own profile
  const member = await getCurrentMember();
  if (!member) return { error: "Please sign in again.", saved: false };

  const data: Record<string, unknown> = {};

  // 2. Only save the fields that were in the form.
  //    (If you edited "About me" only, the sitting fields aren't sent, so they stay as they are.)
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
    // Only DOG or CAT are allowed, so nobody can send something else
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

  // 3. Save, using member.id so you can only update your own row
  await prisma.user.update({ where: { id: member.id }, data });

  // 4. Refresh the profile page with the new data
  revalidatePath("/profile/me");
  return { error: "", saved: true };
}

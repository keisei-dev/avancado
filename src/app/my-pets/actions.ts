"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@/generated/prisma/client";
import { getCurrentMember } from "@/lib/auth/member";
import { prisma } from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";
import { isLogKind, type LogKind } from "@/lib/pets/types";
import {
  parseLogForm,
  parsePetForm,
  type LogInput,
} from "@/lib/pets/validation";

export type PetActionResult = { error: string; petId?: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BUCKET = "pet-photos";
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

// An error whose message is safe to show to the user.
class PetError extends Error {}

function refreshPages() {
  revalidatePath("/my-pets", "layout");
  // Sitter requests show the pet's photo, age and vaccination.
  revalidatePath("/sitter-board", "layout");
}

// ---------- photos ----------

/** Checks an uploaded photo and returns its public URL, or null. */
async function verifyPhoto(memberId: string, path: string) {
  if (!new RegExp(`^${memberId}/[a-f0-9-]+\\.(jpg|png)$`).test(path))
    return null;
  const supabase = await createClient();
  const { data: photo, error } = await supabase.storage.from(BUCKET).info(path);
  if (
    error ||
    !photo ||
    typeof photo.size !== "number" ||
    photo.size <= 0 ||
    photo.size > MAX_PHOTO_BYTES ||
    !["image/jpeg", "image/png"].includes(photo.contentType ?? "")
  )
    return null;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Deletes a replaced photo. Best effort: a failure here is not an error. */
async function removeOldPhoto(memberId: string, imageUrl: string) {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = imageUrl.indexOf(marker);
  if (index === -1) return; // Not in our bucket (for example, seed photos).
  const path = imageUrl.slice(index + marker.length);
  if (!path.startsWith(`${memberId}/`)) return;
  try {
    const supabase = await createClient();
    await supabase.storage.from(BUCKET).remove([path]);
  } catch {
    // Ignore: the pet is already saved.
  }
}

// ---------- pets ----------

/** Adds a pet (no petId) or edits one (with petId). For useActionState. */
export async function savePet(
  _previous: PetActionResult,
  form: FormData,
): Promise<PetActionResult> {
  const member = await getCurrentMember();
  if (!member) return { error: "Please sign in to manage your pets." };

  const parsed = parsePetForm(form);
  if (!parsed.ok) return { error: parsed.error };

  const petId = String(form.get("petId") ?? "");
  const photoPath = String(form.get("imagePath") ?? "");
  if (petId && !UUID.test(petId)) return { error: "Pet not found." };

  let savedId: string;
  try {
    const existing = petId
      ? await prisma.pet.findFirst({
          where: { id: petId, ownerId: member.id, status: "ACTIVE" },
          select: { id: true, imageUrl: true },
        })
      : null;
    if (petId && !existing) return { error: "Pet not found." };

    let imageUrl = existing?.imageUrl ?? null;
    if (photoPath) {
      const url = await verifyPhoto(member.id, photoPath);
      if (!url)
        return {
          error:
            "Photo could not be verified. Please upload a JPG or PNG under 5 MB.",
        };
      imageUrl = url;
    }

    const data = { ...parsed.value, imageUrl };
    if (existing) {
      await prisma.pet.update({ where: { id: existing.id }, data });
      savedId = existing.id;
      if (photoPath && existing.imageUrl)
        await removeOldPhoto(member.id, existing.imageUrl);
    } else {
      const created = await prisma.pet.create({
        data: { ...data, ownerId: member.id },
        select: { id: true },
      });
      savedId = created.id;
    }
  } catch {
    return { error: "Your pet could not be saved. Please try again." };
  }

  refreshPages();
  return { error: "", petId: savedId };
}

/** Hides a pet from My Pets (soft delete). Its history stays in the database. */
export async function archivePet(petId: string): Promise<PetActionResult> {
  const member = await getCurrentMember();
  if (!member) return { error: "Please sign in." };
  if (!UUID.test(petId)) return { error: "Pet not found." };

  try {
    const activeRequests = await prisma.sitterRequest.count({
      where: {
        petId,
        pet: { ownerId: member.id },
        status: { in: ["OPEN", "MATCHED"] },
      },
    });
    if (activeRequests)
      return {
        error:
          "This pet has an open or matched sitter request. Cancel or finish it first.",
      };

    const result = await prisma.pet.updateMany({
      where: { id: petId, ownerId: member.id, status: "ACTIVE" },
      data: { status: "ARCHIVED" },
    });
    if (!result.count) return { error: "Pet not found." };
  } catch {
    return { error: "This pet could not be archived. Please try again." };
  }

  refreshPages();
  return { error: "" };
}

// ---------- health logs ----------

/** Adds a log (no logId) or edits one (with logId). For useActionState. */
export async function saveLog(
  _previous: PetActionResult,
  form: FormData,
): Promise<PetActionResult> {
  const member = await getCurrentMember();
  if (!member) return { error: "Please sign in to manage your pets." };

  const kind = form.get("kind");
  const petId = String(form.get("petId") ?? "");
  const logId = String(form.get("logId") ?? "");
  if (!isLogKind(kind) || !UUID.test(petId) || (logId && !UUID.test(logId)))
    return { error: "Log not found." };

  const parsed = parseLogForm(kind, form);
  if (!parsed.ok) return { error: parsed.error };
  const input = parsed.value;

  try {
    await prisma.$transaction(async (tx) => {
      await findOwnedPet(tx, member.id, petId, input.kind);
      const saved = await writeLog(tx, petId, logId || null, input);
      if (!saved) throw new PetError("Log not found.");
      await touchPet(tx, petId, input.kind === "weight");
    });
  } catch (error) {
    return {
      error:
        error instanceof PetError
          ? error.message
          : "The log could not be saved. Please try again.",
    };
  }

  refreshPages();
  return { error: "", petId };
}

export async function deleteLog(
  kind: string,
  petId: string,
  logId: string,
): Promise<PetActionResult> {
  const member = await getCurrentMember();
  if (!member) return { error: "Please sign in." };
  if (!isLogKind(kind) || !UUID.test(petId) || !UUID.test(logId))
    return { error: "Log not found." };

  try {
    await prisma.$transaction(async (tx) => {
      await findOwnedPet(tx, member.id, petId, kind);
      const removed = await removeLog(tx, kind, petId, logId);
      if (!removed) throw new PetError("Log not found.");
      await touchPet(tx, petId, kind === "weight");
    });
  } catch (error) {
    return {
      error:
        error instanceof PetError
          ? error.message
          : "The log could not be deleted. Please try again.",
    };
  }

  refreshPages();
  return { error: "" };
}

// ---------- helpers used inside a transaction ----------

async function findOwnedPet(
  tx: Prisma.TransactionClient,
  ownerId: string,
  petId: string,
  kind: LogKind,
) {
  const pet = await tx.pet.findFirst({
    where: { id: petId, ownerId, status: "ACTIVE" },
    select: { species: true },
  });
  if (!pet) throw new PetError("Pet not found.");
  if (kind === "walk" && pet.species !== "DOG")
    throw new PetError("Walks can only be logged for dogs.");
}

/**
 * Updates the pet's "Updated" date. After a weight change, it also copies the
 * newest weigh-in to Pet.weight (Pet.weight = latest weight).
 */
async function touchPet(
  tx: Prisma.TransactionClient,
  petId: string,
  syncWeight: boolean,
) {
  const data: Prisma.PetUpdateInput = { updatedAt: new Date() };
  if (syncWeight) {
    const latest = await tx.petWeightLog.findFirst({
      where: { petId },
      orderBy: [{ measuredOn: "desc" }, { createdAt: "desc" }],
      select: { weight: true },
    });
    if (latest) data.weight = latest.weight;
  }
  await tx.pet.update({ where: { id: petId }, data });
}

/** Creates or updates one log. Returns false when the log was not found. */
async function writeLog(
  tx: Prisma.TransactionClient,
  petId: string,
  logId: string | null,
  input: LogInput,
): Promise<boolean> {
  // "where" has petId too, so a log of another pet can never be changed.
  const where = { id: logId ?? "", petId };

  switch (input.kind) {
    case "weight":
      if (!logId) {
        await tx.petWeightLog.create({ data: { petId, ...input.data } });
        return true;
      }
      return (
        (await tx.petWeightLog.updateMany({ where, data: input.data })).count >
        0
      );
    case "vaccine":
      if (!logId) {
        await tx.petVaccine.create({ data: { petId, ...input.data } });
        return true;
      }
      return (
        (await tx.petVaccine.updateMany({ where, data: input.data })).count > 0
      );
    case "vet":
      if (!logId) {
        await tx.petVetVisit.create({ data: { petId, ...input.data } });
        return true;
      }
      return (
        (await tx.petVetVisit.updateMany({ where, data: input.data })).count > 0
      );
    case "food":
      if (!logId) {
        await tx.petFoodLog.create({ data: { petId, ...input.data } });
        return true;
      }
      return (
        (await tx.petFoodLog.updateMany({ where, data: input.data })).count > 0
      );
    case "walk":
      if (!logId) {
        await tx.petWalkLog.create({ data: { petId, ...input.data } });
        return true;
      }
      return (
        (await tx.petWalkLog.updateMany({ where, data: input.data })).count > 0
      );
    case "toilet":
      if (!logId) {
        await tx.petToiletLog.create({ data: { petId, ...input.data } });
        return true;
      }
      return (
        (await tx.petToiletLog.updateMany({ where, data: input.data })).count >
        0
      );
    case "emergency":
      if (!logId) {
        await tx.emergencyContact.create({ data: { petId, ...input.data } });
        return true;
      }
      return (
        (await tx.emergencyContact.updateMany({ where, data: input.data }))
          .count > 0
      );
  }
}

/** Deletes one log. Returns false when the log was not found. */
async function removeLog(
  tx: Prisma.TransactionClient,
  kind: LogKind,
  petId: string,
  logId: string,
): Promise<boolean> {
  const where = { id: logId, petId };
  switch (kind) {
    case "weight":
      return (await tx.petWeightLog.deleteMany({ where })).count > 0;
    case "vaccine":
      return (await tx.petVaccine.deleteMany({ where })).count > 0;
    case "vet":
      return (await tx.petVetVisit.deleteMany({ where })).count > 0;
    case "food":
      return (await tx.petFoodLog.deleteMany({ where })).count > 0;
    case "walk":
      return (await tx.petWalkLog.deleteMany({ where })).count > 0;
    case "toilet":
      return (await tx.petToiletLog.deleteMany({ where })).count > 0;
    case "emergency":
      return (await tx.emergencyContact.deleteMany({ where })).count > 0;
  }
}

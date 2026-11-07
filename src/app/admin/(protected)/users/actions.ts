"use server";

import { revalidatePath } from "next/cache";
import { AccountStatus, VerificationStatus } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma/client";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const USERS_PATH = "/admin/users";

function readId(formData: FormData, key: string): string | null {
  const value = String(formData.get(key) ?? "").trim();
  return UUID_PATTERN.test(value) ? value : null;
}

async function logAdminAction(
  adminId: string,
  action: string,
  targetId: string,
  note?: string,
) {
  await prisma.adminActionLog.create({
    data: {
      adminId,
      action,
      targetType: "USER",
      targetId,
      note: note ?? null,
    },
  });
}

export async function hideUser(formData: FormData) {
  const admin = await requireAdmin();
  const userId = readId(formData, "userId");
  if (!userId || userId === admin.id) {
    return;
  }

  await prisma.user.update({
    where: { id: userId },
    data: { accountStatus: AccountStatus.HIDDEN },
  });
  await logAdminAction(admin.id, "HIDE_USER", userId);
  revalidatePath(USERS_PATH);
}

export async function restoreUser(formData: FormData) {
  const admin = await requireAdmin();
  const userId = readId(formData, "userId");
  if (!userId) {
    return;
  }

  await prisma.user.update({
    where: { id: userId },
    data: { accountStatus: AccountStatus.ACTIVE },
  });
  await logAdminAction(admin.id, "RESTORE_USER", userId);
  revalidatePath(USERS_PATH);
}

/**
 * Prototype "Delete permanently". AccountStatus has no DELETED value, so this
 * hides the account (HIDDEN) instead of removing the row.
 * TODO: persist a deleted state when the schema supports it.
 */
export async function deleteUser(formData: FormData) {
  const admin = await requireAdmin();
  const userId = readId(formData, "userId");
  if (!userId || userId === admin.id) {
    return;
  }

  await prisma.user.update({
    where: { id: userId },
    data: { accountStatus: AccountStatus.HIDDEN },
  });
  await logAdminAction(
    admin.id,
    "DELETE_USER",
    userId,
    "HIDDEN until AccountStatus supports DELETED",
  );
  revalidatePath(USERS_PATH);
}

export async function approveVerification(formData: FormData) {
  const admin = await requireAdmin();
  const verificationId = readId(formData, "verificationId");
  if (!verificationId) {
    return;
  }

  const row = await prisma.idVerification.findUnique({
    where: { id: verificationId },
    select: { id: true, userId: true, status: true },
  });
  if (!row || row.status !== VerificationStatus.PENDING) {
    return;
  }

  await prisma.$transaction([
    prisma.idVerification.update({
      where: { id: row.id },
      data: {
        status: VerificationStatus.APPROVED,
        reviewedById: admin.id,
        reviewedAt: new Date(),
        rejectionReason: null,
      },
    }),
    prisma.user.update({
      where: { id: row.userId },
      data: { isVerified: true },
    }),
  ]);
  await logAdminAction(admin.id, "APPROVE_VERIFICATION", row.userId);
  revalidatePath(USERS_PATH);
}

export async function rejectVerification(formData: FormData) {
  const admin = await requireAdmin();
  const verificationId = readId(formData, "verificationId");
  if (!verificationId) {
    return;
  }

  const row = await prisma.idVerification.findUnique({
    where: { id: verificationId },
    select: { id: true, userId: true, status: true },
  });
  if (!row || row.status !== VerificationStatus.PENDING) {
    return;
  }

  await prisma.$transaction([
    prisma.idVerification.update({
      where: { id: row.id },
      data: {
        status: VerificationStatus.REJECTED,
        reviewedById: admin.id,
        reviewedAt: new Date(),
        rejectionReason: "Rejected by admin",
      },
    }),
    prisma.user.update({
      where: { id: row.userId },
      data: { isVerified: false },
    }),
  ]);
  await logAdminAction(admin.id, "REJECT_VERIFICATION", row.userId);
  revalidatePath(USERS_PATH);
}

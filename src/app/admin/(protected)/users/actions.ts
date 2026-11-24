"use server";

import { revalidatePath } from "next/cache";
import { AccountStatus, VerificationStatus } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth/admin";
import { DeleteUserError, hardDeleteUser } from "@/lib/admin/delete-user";
import { prisma } from "@/lib/prisma/client";
import { deleteAuthUser } from "@/lib/supabase/admin";

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

export type DeleteUserResult = {
  error: string | null;
  removed?: boolean;
};

/**
 * Permanently removes the Prisma user, then the matching Supabase Auth user.
 * Auth deletion uses SUPABASE_SERVICE_ROLE_KEY and never runs in the browser.
 */
export async function deleteUser(
  formData: FormData,
): Promise<DeleteUserResult> {
  const admin = await requireAdmin();
  const userId = readId(formData, "userId");
  if (!userId) {
    return { error: "This account could not be deleted." };
  }
  if (userId === admin.id) {
    return { error: "You can't delete your own admin account." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await hardDeleteUser(tx, userId, admin.id);
    });
  } catch (error) {
    if (error instanceof DeleteUserError) {
      return { error: error.message, removed: error.alreadyRemoved };
    }
    console.error("deleteUser database", error);
    return { error: "This account could not be deleted. Try again." };
  }

  try {
    await deleteAuthUser(userId);
  } catch (error) {
    console.error("deleteUser auth", error);
    return {
      error:
        "Their profile and data were deleted. The login could not be removed, so they may still be able to sign in.",
      removed: true,
    };
  }

  revalidatePath(USERS_PATH);
  revalidatePath("/admin");
  return { error: null };
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

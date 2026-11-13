"use server";

import { revalidatePath } from "next/cache";
import { PostStatus, ReportStatus } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma/client";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const COMMUNITY_ADMIN_PATH = "/admin/community";

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
      targetType: "POST",
      targetId,
      note: note ?? null,
    },
  });
}

function revalidateCommunity(postId: string) {
  revalidatePath(COMMUNITY_ADMIN_PATH);
  revalidatePath("/community", "layout");
  revalidatePath(`/community/${postId}`);
}

async function resolveOpenPostReports(postId: string, adminId: string) {
  await prisma.report.updateMany({
    where: { postId, status: ReportStatus.OPEN },
    data: {
      status: ReportStatus.RESOLVED,
      handledById: adminId,
      handledAt: new Date(),
    },
  });
}

export async function hideCommunityPost(formData: FormData) {
  const admin = await requireAdmin();
  const postId = readId(formData, "postId");
  if (!postId) return;

  const result = await prisma.communityPost.updateMany({
    where: { id: postId, status: { not: PostStatus.HIDDEN } },
    data: { status: PostStatus.HIDDEN },
  });
  if (!result.count) return;

  await resolveOpenPostReports(postId, admin.id);
  await logAdminAction(admin.id, "HIDE_POST", postId);
  revalidateCommunity(postId);
}

export async function restoreCommunityPost(formData: FormData) {
  const admin = await requireAdmin();
  const postId = readId(formData, "postId");
  if (!postId) return;

  // Unhide always restores ACTIVE. FOUND is not stored separately from HIDDEN.
  const result = await prisma.communityPost.updateMany({
    where: { id: postId, status: PostStatus.HIDDEN },
    data: { status: PostStatus.ACTIVE },
  });
  if (!result.count) return;

  await logAdminAction(admin.id, "RESTORE_POST", postId);
  revalidateCommunity(postId);
}

/**
 * Prototype "Delete". PostStatus has no DELETED value, so this hides the post
 * (HIDDEN) instead of removing the row.
 * TODO: persist a deleted state when the schema supports it.
 */
export async function deleteCommunityPost(formData: FormData) {
  const admin = await requireAdmin();
  const postId = readId(formData, "postId");
  if (!postId) return;

  const result = await prisma.communityPost.updateMany({
    where: { id: postId },
    data: { status: PostStatus.HIDDEN },
  });
  if (!result.count) return;

  await resolveOpenPostReports(postId, admin.id);
  await logAdminAction(
    admin.id,
    "DELETE_POST",
    postId,
    "HIDDEN until PostStatus supports DELETED",
  );
  revalidateCommunity(postId);
}

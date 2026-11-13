"use server";

import { revalidatePath } from "next/cache";
import { PostStatus, ReportStatus } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";

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
  revalidatePath("/admin");
  revalidatePath("/community", "layout");
  revalidatePath(`/community/${postId}`);
}

const COMMUNITY_IMAGE_MARKER = "/community-posts/";

/** Storage path for a photo uploaded to the community-posts bucket, if this URL is one. */
function communityPostStoragePath(imageUrl: string): string | null {
  const index = imageUrl.indexOf(COMMUNITY_IMAGE_MARKER);
  if (index === -1) return null;
  const path = imageUrl
    .slice(index + COMMUNITY_IMAGE_MARKER.length)
    .split("?")[0];
  if (!path || path.includes("..")) return null;
  try {
    return decodeURIComponent(path);
  } catch {
    return null;
  }
}

async function removeCommunityPostImage(imageUrl: string) {
  const path = communityPostStoragePath(imageUrl);
  if (!path) return;
  try {
    const supabase = await createClient();
    const { error } = await supabase.storage
      .from("community-posts")
      .remove([path]);
    if (error) {
      console.error("Community post image could not be removed.", error.message);
    }
  } catch (error) {
    console.error("Community post image could not be removed.", error);
  }
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

export type DeleteCommunityPostResult = {
  error: string | null;
};

/**
 * Permanent delete. PostLike, Report, and Conversation already use
 * onDelete: Cascade (messages and participants follow the conversation),
 * so those rows are removed with the post and are not deleted here.
 */
export async function deleteCommunityPost(
  formData: FormData,
): Promise<DeleteCommunityPostResult> {
  const admin = await requireAdmin();
  const postId = readId(formData, "postId");
  if (!postId) {
    return { error: "This post could not be deleted." };
  }

  const post = await prisma.communityPost.findUnique({
    where: { id: postId },
    select: { id: true, imageUrl: true },
  });
  if (!post) {
    return { error: "This post no longer exists." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.communityPost.delete({ where: { id: postId } });
      await tx.adminActionLog.create({
        data: {
          adminId: admin.id,
          action: "DELETE_POST",
          targetType: "POST",
          targetId: postId,
        },
      });
    });
  } catch (error) {
    const missing =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2025";
    if (missing) return { error: "This post no longer exists." };
    return { error: "This post could not be deleted. Try again." };
  }

  await removeCommunityPostImage(post.imageUrl);
  revalidateCommunity(postId);
  return { error: null };
}

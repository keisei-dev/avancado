"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertNotAdmin } from "@/lib/auth/admin";
import { getCurrentMember } from "@/lib/auth/member";
import { createClient } from "@/lib/supabase/server";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function createPost(_previous: { error: string }, data: FormData) {
  const blocked = await assertNotAdmin();
  if (blocked) return { error: blocked };
  const member = await getCurrentMember();
  if (!member) return { error: "Please sign in to create a post." };
  const caption = String(data.get("caption") ?? "").trim();
  const location = String(data.get("location") ?? "").trim();
  const type = data.get("type");
  const path = String(data.get("imagePath") ?? "");
  const postId = String(data.get("postId") ?? "");
  if (!caption || caption.length > 2000)
    return { error: "Write a caption of up to 2,000 characters." };
  if (location.length > 100)
    return { error: "Keep the location under 100 characters." };
  if (type !== "GENERAL" && type !== "LOST_PET")
    return { error: "Choose a post type." };
  if (postId && !uuid.test(postId)) return { error: "Post not found." };
  try {
    const { prisma } = await import("@/lib/prisma/client");
    const existing = postId
      ? await prisma.communityPost.findFirst({
          where: { id: postId, authorId: member.id, status: { not: "HIDDEN" } },
        })
      : null;
    if (postId && !existing) return { error: "Post not found." };
    let imageUrl = existing?.imageUrl ?? "";
    if (path) {
      if (!new RegExp(`^${member.id}/[a-f0-9-]+\\.(jpg|png)$`).test(path))
        return { error: "Please add a JPG or PNG photo." };
      const supabase = await createClient();
      const { data: photo, error } = await supabase.storage
        .from("community-posts")
        .info(path);
      if (
        error ||
        !photo ||
        typeof photo.size !== "number" ||
        photo.size <= 0 ||
        photo.size > 5242880 ||
        !["image/jpeg", "image/png"].includes(photo.contentType ?? "")
      )
        return {
          error:
            "Photo could not be verified. Please upload a JPG or PNG under 5 MB.",
        };
      imageUrl = supabase.storage.from("community-posts").getPublicUrl(path)
        .data.publicUrl;
    }
    if (!imageUrl) return { error: "Please add a photo." };
    const values = {
      caption,
      location: location || "Vancouver",
      type: type as "GENERAL" | "LOST_PET",
      imageUrl,
    };
    if (existing) {
      const result = await prisma.communityPost.updateMany({
        where: {
          id: existing.id,
          authorId: member.id,
          status: { not: "HIDDEN" },
        },
        data: {
          ...values,
          status:
            type === "LOST_PET" && existing.status === "FOUND"
              ? "FOUND"
              : "ACTIVE",
        },
      });
      if (!result.count) return { error: "Post not found." };
    } else
      await prisma.communityPost.create({
        data: { authorId: member.id, ...values },
      });
  } catch {
    return { error: "Your post could not be saved. Please try again." };
  }
  revalidatePath("/community", "layout");
  if (data.get("inline") === "true") return { error: "", success: true };
  redirect("/community?posted=1");
}

export async function reactToPost(postId: string, liked: boolean) {
  const blocked = await assertNotAdmin();
  if (blocked) return { error: blocked };
  const member = await getCurrentMember();
  if (!member) return { error: "Please sign in to react." };
  if (!uuid.test(postId) || typeof liked !== "boolean")
    return { error: "Invalid post." };
  try {
    const { prisma } = await import("@/lib/prisma/client");
    await prisma.$transaction(async (tx) => {
      const post = await tx.communityPost.findFirst({
        where: {
          id: postId,
          status: { not: "HIDDEN" },
          author: { accountStatus: "ACTIVE" },
        },
      });
      if (!post) throw new Error("Unavailable");
      if (liked) {
        const added = await tx.postLike.createMany({
          data: [{ postId, userId: member.id }],
          skipDuplicates: true,
        });
        if (added.count)
          await tx.communityPost.update({
            where: { id: postId },
            data: { likeCount: { increment: 1 } },
          });
      } else {
        const removed = await tx.postLike.deleteMany({
          where: { postId, userId: member.id },
        });
        if (removed.count)
          await tx.communityPost.update({
            where: { id: postId },
            data: { likeCount: { decrement: 1 } },
          });
      }
    });
    revalidatePath("/community", "layout");
    return { error: "" };
  } catch {
    return { error: "Reaction could not be saved. Please try again." };
  }
}

export async function deleteCommunityPost(postId: string) {
  const member = await getCurrentMember();
  if (!member || !uuid.test(postId)) return { error: "Please sign in." };
  try {
    const { prisma } = await import("@/lib/prisma/client");
    const result = await prisma.communityPost.deleteMany({
      where: { id: postId, authorId: member.id },
    });
    if (!result.count) return { error: "Post not found." };
    revalidatePath("/community", "layout");
    revalidatePath(`/profile/${member.id}`);
    return { error: "" };
  } catch {
    return { error: "Post could not be deleted." };
  }
}

export async function markPetFound(postId: string) {
  const member = await getCurrentMember();
  if (!member || !uuid.test(postId)) return { error: "Please sign in." };
  try {
    const { prisma } = await import("@/lib/prisma/client");
    await prisma.$transaction(async (tx) => {
      const result = await tx.communityPost.updateMany({
        where: {
          id: postId,
          authorId: member.id,
          type: "LOST_PET",
          status: "ACTIVE",
        },
        data: { status: "FOUND" },
      });
      if (!result.count) throw new Error("Unavailable");
      await tx.conversationParticipant.updateMany({
        where: { conversation: { postId, type: "LOST_FOUND" } },
        data: { archivedAt: new Date() },
      });
    });
    revalidatePath("/community", "layout");
    revalidatePath("/messages");
    return { error: "" };
  } catch {
    return { error: "This alert could not be marked as found." };
  }
}

export async function reportCommunityPost(postId: string, reason: string) {
  const blocked = await assertNotAdmin();
  if (blocked) return { error: blocked };
  const member = await getCurrentMember();
  if (!member || !uuid.test(postId)) return { error: "Please sign in." };
  if (
    ![
      "Spam or misleading content",
      "Harassment or inappropriate content",
      "Animal welfare concern",
      "Other",
    ].includes(reason)
  )
    return { error: "Choose a reason." };
  try {
    const { prisma } = await import("@/lib/prisma/client");
    const post = await prisma.communityPost.findFirst({
      where: {
        id: postId,
        authorId: { not: member.id },
        status: { not: "HIDDEN" },
        author: { accountStatus: "ACTIVE" },
      },
    });
    if (!post) return { error: "Post not found." };
    await prisma.report.create({
      data: { postId, reporterId: member.id, reason },
    });
    return { error: "" };
  } catch {
    return { error: "Report could not be submitted." };
  }
}

export async function messagePostAuthor(postId: string) {
  const member = await getCurrentMember();
  if (!member) redirect("/login");
  if (!uuid.test(postId)) return { error: "Invalid post." };
  let conversationId: string;
  try {
    const { prisma } = await import("@/lib/prisma/client");
    const post = await prisma.communityPost.findFirst({
      where: {
        id: postId,
        type: "LOST_PET",
        status: "ACTIVE",
        authorId: { not: member.id },
        author: { accountStatus: "ACTIVE" },
      },
    });
    if (!post) return { error: "This alert is no longer active." };
    const conversation = await prisma.conversation.upsert({
      where: { postId_initiatorId: { postId, initiatorId: member.id } },
      update: {},
      create: {
        postId,
        initiatorId: member.id,
        type: "LOST_FOUND",
        participants: {
          create: [{ userId: member.id }, { userId: post.authorId }],
        },
      },
    });
    await prisma.conversationParticipant.updateMany({
      where: { conversationId: conversation.id, userId: member.id },
      data: { archivedAt: null },
    });
    conversationId = conversation.id;
  } catch {
    return { error: "Conversation could not be opened." };
  }
  redirect(`/messages/${conversationId}`);
}

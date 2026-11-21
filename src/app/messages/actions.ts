"use server";

import { revalidatePath } from "next/cache";
import { getCurrentMember, isAdminMember } from "@/lib/auth/member";
import { accessibleConversation, uuid } from "@/lib/messages/queries";
import { prisma } from "@/lib/prisma/client";

export async function sendMessage(conversationId: string, content: string) {
  const member = await getCurrentMember();
  if (!member || isAdminMember(member))
    return { error: "Please sign in with a personal account." };
  if (
    !uuid.test(conversationId) ||
    typeof content !== "string" ||
    !content.trim() ||
    content.trim().length > 2000
  )
    return { error: "Write a message of up to 2,000 characters." };
  try {
    await prisma.$transaction(async (tx) => {
      const conversation = await tx.conversation.findFirst({
        where: { id: conversationId, ...accessibleConversation(member.id) },
        include: { participants: true },
      });
      const participant = conversation?.participants.find(
        (p) => p.userId === member.id,
      );
      if (!conversation || !participant || participant.archivedAt)
        throw new Error("Unavailable");
      const message = await tx.message.create({
        data: { conversationId, senderId: member.id, content: content.trim() },
      });
      await tx.conversationParticipant.update({
        where: { conversationId_userId: { conversationId, userId: member.id } },
        data: { lastReadAt: message.createdAt },
      });
      await tx.notification.createMany({
        data: conversation.participants
          .filter((p) => p.userId !== member.id)
          .map((p) => ({
            userId: p.userId,
            type: "NEW_MESSAGE" as const,
            title: "New message",
            body: `${member.name} sent you a message.`,
            linkPath: `/messages/${conversationId}`,
          })),
      });
    });
  } catch {
    return {
      error:
        "Message could not be sent. Check that the conversation is available and unarchived.",
    };
  }
  revalidatePath("/messages", "layout");
  return { error: "" };
}

export async function setConversationArchived(
  conversationId: string,
  archived: boolean,
) {
  const member = await getCurrentMember();
  if (
    !member ||
    isAdminMember(member) ||
    !uuid.test(conversationId) ||
    typeof archived !== "boolean"
  )
    return { error: "Invalid conversation." };
  try {
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, ...accessibleConversation(member.id) },
      select: { id: true },
    });
    if (!conversation) return { error: "Conversation unavailable." };
    await prisma.conversationParticipant.update({
      where: { conversationId_userId: { conversationId, userId: member.id } },
      data: { archivedAt: archived ? new Date() : null },
    });
  } catch {
    return { error: "Conversation could not be updated." };
  }
  revalidatePath("/messages", "layout");
  return { error: "" };
}

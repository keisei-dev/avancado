import { notFound, redirect } from "next/navigation";
import { getCurrentMember, isAdminMember } from "@/lib/auth/member";
import {
  accessibleConversation,
  getConversations,
  uuid,
} from "@/lib/messages/queries";
import { prisma } from "@/lib/prisma/client";
import { MessagesPage } from "@/components/messages/messages-page";

export const instant = false;
export default async function Page({
  params,
}: PageProps<"/messages/[conversationId]">) {
  const member = await getCurrentMember();
  if (!member) redirect("/login");
  if (isAdminMember(member)) redirect("/admin");
  const { conversationId } = await params;
  if (!uuid.test(conversationId)) notFound();
  const readAt = new Date();
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, ...accessibleConversation(member.id) },
    include: {
      participants: {
        include: {
          user: {
            select: { id: true, name: true, image: true, isVerified: true },
          },
        },
      },
      messages: { orderBy: [{ createdAt: "asc" }, { id: "asc" }] },
      post: true,
      sitterRequest: { include: { pet: { select: { imageUrl: true } } } },
    },
  });
  if (!conversation) notFound();
  await prisma.conversationParticipant.update({
    where: { conversationId_userId: { conversationId, userId: member.id } },
    data: { lastReadAt: readAt },
  });
  const me = conversation.participants.find((p) => p.userId === member.id)!;
  const other = conversation.participants.find(
    (p) => p.userId !== member.id,
  )?.user;
  if (!other) notFound();
  const post = conversation.post;
  const request = conversation.sitterRequest;
  const context = post
    ? {
        title: post.status === "FOUND" ? "Pet found" : "Lost pet alert",
        image: post.imageUrl,
        caption: post.caption,
        href: `/community/${post.id}`,
        status: post.status,
      }
    : {
        title: request!.title,
        image: request!.pet.imageUrl,
        caption: request!.description,
        href: `/sitter-board/${request!.id}`,
        status: request!.status,
      };
  return (
    <MessagesPage
      key={conversationId}
      memberId={member.id}
      conversations={await getConversations(member.id)}
      thread={{
        id: conversationId,
        archived: Boolean(me.archivedAt),
        other,
        context,
        messages: conversation.messages.map((m) => ({
          id: m.id,
          senderId: m.senderId,
          content: m.content,
          createdAt: m.createdAt.toISOString(),
        })),
      }}
    />
  );
}

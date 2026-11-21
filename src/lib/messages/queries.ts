import "server-only";
import { prisma } from "@/lib/prisma/client";

export const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Apply the same visibility rules to reads and mutations.
export function accessibleConversation(userId: string) {
  return {
    participants: { some: { userId } },
    NOT: {
      participants: { some: { user: { accountStatus: "HIDDEN" as const } } },
    },
    OR: [
      {
        type: "LOST_FOUND" as const,
        post: {
          status: { not: "HIDDEN" as const },
          author: { accountStatus: "ACTIVE" as const },
        },
      },
      {
        type: "SITTING" as const,
        sitterRequest: { status: { not: "HIDDEN" as const } },
      },
    ],
  };
}

export async function getConversations(userId: string) {
  const rows = await prisma.conversation.findMany({
    where: accessibleConversation(userId),
    include: {
      participants: {
        include: {
          user: {
            select: { id: true, name: true, image: true, isVerified: true },
          },
        },
      },
      messages: { orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: 1 },
    },
  });
  return Promise.all(
    rows.map(async (row) => {
      const me = row.participants.find((p) => p.userId === userId)!;
      const other = row.participants.find((p) => p.userId !== userId)?.user;
      const latest = row.messages[0];
      return {
        id: row.id,
        type: row.type,
        archived: Boolean(me.archivedAt),
        other: other ?? me.user,
        preview: latest
          ? `${latest.senderId === userId ? "You: " : ""}${latest.content}`
          : "New conversation",
        updatedAt: (latest?.createdAt ?? row.createdAt).toISOString(),
        unread: await prisma.message.count({
          where: {
            conversationId: row.id,
            senderId: { not: userId },
            ...(me.lastReadAt ? { createdAt: { gt: me.lastReadAt } } : {}),
          },
        }),
      };
    }),
  );
}

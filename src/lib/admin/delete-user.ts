import { Prisma, UserRole } from "@/generated/prisma/client";

export class DeleteUserError extends Error {
  constructor(
    message: string,
    readonly alreadyRemoved = false,
  ) {
    super(message);
    this.name = "DeleteUserError";
  }
}

/**
 * Removes one member and the rows that belong to them.
 * Shared rows are handled before the user delete so restricted foreign keys
 * do not abort the transaction. AdminActionLog is written by the acting admin
 * after the member row is gone; targetId has no foreign key.
 */
export async function hardDeleteUser(
  tx: Prisma.TransactionClient,
  userId: string,
  adminId: string,
) {
  const user = await tx.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });
  if (!user) {
    throw new DeleteUserError("This account no longer exists.", true);
  }
  if (user.role === UserRole.ADMIN) {
    throw new DeleteUserError("Admin accounts can't be deleted.");
  }

  const pets = await tx.pet.findMany({
    where: { ownerId: userId },
    select: { id: true },
  });
  const petIds = pets.map((pet) => pet.id);

  const requests = await tx.sitterRequest.findMany({
    where: {
      OR: [
        { authorId: userId },
        ...(petIds.length > 0 ? [{ petId: { in: petIds } }] : []),
      ],
    },
    select: { id: true },
  });
  const requestIds = requests.map((request) => request.id);

  if (requestIds.length > 0) {
    const requestConversations = await tx.conversation.findMany({
      where: { sitterRequestId: { in: requestIds } },
      select: { id: true },
    });
    const requestConversationIds = requestConversations.map((row) => row.id);
    if (requestConversationIds.length > 0) {
      await tx.message.deleteMany({
        where: { conversationId: { in: requestConversationIds } },
      });
      await tx.conversationParticipant.deleteMany({
        where: { conversationId: { in: requestConversationIds } },
      });
      await tx.conversation.deleteMany({
        where: { id: { in: requestConversationIds } },
      });
    }
    await tx.sitterApply.deleteMany({
      where: { requestId: { in: requestIds } },
    });
    await tx.sittingReport.deleteMany({
      where: { requestId: { in: requestIds } },
    });
    await tx.report.deleteMany({
      where: {
        OR: [
          { requestId: { in: requestIds } },
          { review: { requestId: { in: requestIds } } },
        ],
      },
    });
    await tx.review.deleteMany({ where: { requestId: { in: requestIds } } });
    await tx.sitterRequest.deleteMany({ where: { id: { in: requestIds } } });
  }

  const likes = await tx.postLike.groupBy({
    by: ["postId"],
    where: { userId, post: { authorId: { not: userId } } },
    _count: { _all: true },
  });
  for (const like of likes) {
    const post = await tx.communityPost.findUnique({
      where: { id: like.postId },
      select: { likeCount: true },
    });
    if (!post) continue;
    await tx.communityPost.update({
      where: { id: like.postId },
      data: { likeCount: Math.max(0, post.likeCount - like._count._all) },
    });
  }

  const started = await tx.conversation.findMany({
    where: { initiatorId: userId },
    select: { id: true },
  });
  const startedIds = started.map((row) => row.id);
  if (startedIds.length > 0) {
    await tx.message.deleteMany({
      where: { conversationId: { in: startedIds } },
    });
    await tx.conversationParticipant.deleteMany({
      where: { conversationId: { in: startedIds } },
    });
    await tx.conversation.deleteMany({ where: { id: { in: startedIds } } });
  }

  await tx.message.deleteMany({ where: { senderId: userId } });
  await tx.conversationParticipant.deleteMany({ where: { userId } });

  await tx.user.delete({ where: { id: userId } });

  await tx.adminActionLog.create({
    data: {
      adminId,
      action: "DELETE_USER",
      targetType: "USER",
      targetId: userId,
    },
  });
}

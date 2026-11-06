import "server-only";

import { prisma } from "@/lib/prisma/client";
import { buildContent } from "@/lib/notifications/content";
import { buildLinkPath } from "@/lib/notifications/link-path";
import type { CreateNotificationInput } from "@/types/notification";

// Creates one in-app notification for one user.
// Call this from a Server Action or Route Handler when an event happens.
// ======================================
// Example:
//   await createNotification({
//     userId: ownerId,
//     type: "APPLICATION_RECEIVED",
//     requestId: request.id,
//     actorName: applicant.name,
//     petName: pet.name,
//   });
// ======================================

export async function createNotification(input: CreateNotificationInput) {
  const { userId, type, requestId, conversationId, actorName, petName } = input;

  const linkPath = buildLinkPath(type, { requestId, conversationId });
  const { title, body } = buildContent(type, { actorName, petName });

  return prisma.notification.create({
    data: { userId, type, title, body, linkPath },
  });
}

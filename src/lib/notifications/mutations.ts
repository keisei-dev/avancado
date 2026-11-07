import "server-only";

import { prisma } from "@/lib/prisma/client";

// Marks one notification as read. Returns true if a row was changed.
// updateMany lets us add `userId` to the filter, so a user can never
// change someone else's notification.

export async function markAsRead(userId: string, notificationId: string) {
  const result = await prisma.notification.updateMany({
    where: { id: notificationId, userId, isRead: false },
    data: { isRead: true },
  });
  return result.count > 0;
}

// Marks all unread notifications of one user as read. Returns how many changed.
export async function markAllAsRead(userId: string) {
  const result = await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
  return result.count;
}

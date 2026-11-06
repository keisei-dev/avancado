import "server-only";

import { prisma } from "@/lib/prisma/client";
import { toNotificationView } from "@/lib/notifications/mapper";

// The newest notifications of one user (newest first).
export async function getMyNotifications(userId: string, limit = 20) {
  const rows = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map(toNotificationView);
}

// How many unread notifications one user has.
// This is a separate query because the list above is limited to `limit` rows.
export async function getUnreadCount(userId: string) {
  return prisma.notification.count({ where: { userId, isRead: false } });
}

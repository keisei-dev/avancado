import type { Notification } from "@/generated/prisma/client";
import type { NotificationView } from "@/types/notification";

// Converts one database row into the shape the UI uses.
export function toNotificationView(row: Notification): NotificationView {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    linkPath: row.linkPath,
    isRead: row.isRead,
    createdAt: row.createdAt.toISOString(),
  };
}

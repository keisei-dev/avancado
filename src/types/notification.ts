import type { NotificationType } from "@/generated/prisma/client";

export type { NotificationType };

// IDs that a notification can point to. Which one is needed depends on the type.
export type NotificationTarget = {
  requestId?: string;
  conversationId?: string;
};

// Names used to write the notification text, e.g. "Marcus offered to help with Sunny."
export type NotificationContext = {
  actorName?: string;
  petName?: string;
};

// Everything a caller must pass to createNotification().
export type CreateNotificationInput = {
  userId: string; // The user who receives the notification.
  type: NotificationType;
} & NotificationTarget &
  NotificationContext;

// The shape the UI receives.
export type NotificationView = {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  linkPath: string | null;
  isRead: boolean;
  createdAt: string; // ISO string, e.g. "2026-11-06T10:00:00.000Z"
};

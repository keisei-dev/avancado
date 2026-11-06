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

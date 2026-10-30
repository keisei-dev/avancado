import { prisma } from "../client";
import { conversationId } from "./conversations";
import { seedUuid } from "./helpers";
import { userId } from "./users";

const MINUTE = 60 * 1000;

// linkPath is the page that opens when the notification is tapped.
const notifications = [
  {
    key: "1",
    user: "maya",
    type: "APPLICATION_RECEIVED",
    title: "New applicant",
    body: "Marcus Chen offered to help with Sunny.",
    linkPath: `/sitter-board/my-requests/${seedUuid("request:2401")}`,
    minutesAgo: 20,
    isRead: false,
  },
  {
    key: "2",
    user: "maya",
    type: "NEW_MESSAGE",
    title: "New message",
    body: "Ava Brooks sent you a message about Luna.",
    linkPath: `/messages/${conversationId("ava-5")}`,
    minutesAgo: 60,
    isRead: false,
  },
  {
    key: "3",
    user: "maya",
    type: "APPLICATION_ACCEPTED",
    title: "You were chosen as the sitter",
    body: "Noah Williams confirmed you as Milo’s sitter.",
    linkPath: `/sitter-board/${seedUuid("request:2407")}`,
    minutesAgo: 1500,
    isRead: false,
  },
] as const;

export async function seedNotifications() {
  for (const notification of notifications) {
    const id = seedUuid(`notification:${notification.key}`);
    const data = {
      userId: userId(notification.user),
      type: notification.type,
      title: notification.title,
      body: notification.body,
      linkPath: notification.linkPath,
      isRead: notification.isRead,
    } as const;
    await prisma.notification.upsert({
      where: { id },
      update: data,
      create: {
        id,
        ...data,
        createdAt: new Date(Date.now() - notification.minutesAgo * MINUTE),
      },
    });
  }

  console.log(`Seeded ${notifications.length} notifications.`);
}

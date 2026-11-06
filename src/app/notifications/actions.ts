"use server";

import { revalidatePath } from "next/cache";
import { getCurrentMember } from "@/lib/auth/member";
import { markAllAsRead, markAsRead } from "@/lib/notifications/mutations";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Marks every unread notification of the logged-in user as read.
export async function markAllReadAction() {
  const member = await getCurrentMember();
  if (!member) return;

  await markAllAsRead(member.id);
  revalidatePath("/", "layout"); // Refresh
}

// Marks one notification as read.
export async function markReadAction(notificationId: string) {
  const member = await getCurrentMember();
  if (!member) return;

  // The id comes from the browser, so never trust it: check its shape first.
  if (!UUID_PATTERN.test(notificationId)) return;

  await markAsRead(member.id, notificationId);
  revalidatePath("/", "layout");
}

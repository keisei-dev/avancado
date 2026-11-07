// Notion flow: Notifications

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { BellOff } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { NotificationList } from "@/components/notifications/notification-list";
import { getCurrentMember } from "@/lib/auth/member";
import { getMyNotifications } from "@/lib/notifications/queries";
import { markAllReadAction, markReadAction } from "./actions";

export const metadata = { title: "Notifications" };

export default function NotificationsPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-4 tablet:p-8">
      <h1 className="font-display text-2xl font-bold text-brown">
        Notifications
      </h1>
      {/* The content reads cookies and the database, so it needs <Suspense>. */}
      <Suspense
        fallback={
          <p className="text-sm text-muted" role="status">
            Loading notifications…
          </p>
        }
      >
        <NotificationsContent />
      </Suspense>
    </main>
  );
}

async function NotificationsContent() {
  const member = await getCurrentMember();
  if (!member) redirect("/login");

  const notifications = await getMyNotifications(member.id, 50);
  const hasUnread = notifications.some((item) => !item.isRead);

  if (notifications.length === 0) {
    return (
      <EmptyState
        icon={<BellOff size={24} />}
        title="You're all caught up"
        text="New notifications will show up here."
      />
    );
  }

  return (
    <>
      {hasUnread && (
        <form action={markAllReadAction} className="self-end">
          <button
            type="submit"
            className={buttonClass({ className: "min-h-10" })}
          >
            Mark all read
          </button>
        </form>
      )}
      <NotificationList
        notifications={notifications}
        markReadAction={markReadAction}
      />
    </>
  );
}

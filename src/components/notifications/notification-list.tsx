"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import type { NotificationView } from "@/types/notification";

export type NotificationListProps = {
  notifications: NotificationView[];
  markReadAction: (notificationId: string) => void | Promise<void>;
};

// The full list shown on /notifications.
export function NotificationList({
  notifications,
  markReadAction,
}: NotificationListProps) {
  // Ids marked as read in this browser (shows the change immediately).
  const [readIds, setReadIds] = useState<string[]>([]);

  return (
    <ul className="grid gap-2">
      {notifications.map((item) => {
        const isRead = item.isRead || readIds.includes(item.id);

        function handleClick() {
          if (isRead) return;
          setReadIds((previous) => [...previous, item.id]);
          void markReadAction(item.id);
        }

        const itemClass = cn(
          "block rounded-16 border border-line p-4 transition-colors",
          isRead
            ? "bg-white hover:bg-ivory"
            : "bg-amber-soft/40 hover:bg-amber-soft/20",
        );

        const content = (
          <>
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-semibold text-brown">{item.title}</p>
              {!isRead && <Badge tone="amber">New</Badge>}
            </div>
            {item.body && (
              <p className="mt-1 text-sm text-muted">{item.body}</p>
            )}
          </>
        );

        return (
          <li key={item.id}>
            {item.linkPath ? (
              <Link
                href={item.linkPath}
                onClick={handleClick}
                className={itemClass}
              >
                {content}
              </Link>
            ) : (
              <div className={itemClass}>{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

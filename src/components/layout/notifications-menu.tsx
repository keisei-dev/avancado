"use client";

// UI library (P2): NotificationsMenu
/**
 * Bell button in the top bar. Click it to open the list.
 * Unread items have a yellow (amber-soft) background.
 * "Mark all read" makes them all read. Empty list: "You're all caught up."
 */

import { useState } from "react";
import { Bell } from "lucide-react";

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  read: boolean;
};

export type NotificationsMenuProps = {
  notifications?: NotificationItem[];
  onMarkAllRead?: () => void;
};

export function NotificationsMenu({
  notifications = [],
  onMarkAllRead,
}: NotificationsMenuProps) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(notifications);

  const unread = items.filter((item) => !item.read).length;

  function markAllRead() {
    setItems(items.map((item) => ({ ...item, read: true })));
    onMarkAllRead?.();
  }

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label={`Notifications, ${unread} unread`}
        className="relative grid size-10 place-items-center rounded-12 border border-line bg-white text-brown-2 hover:border-line-strong"
      >
        <Bell size={19} />
        {unread > 0 && (
          <span className="absolute -top-1.5 -right-1.5 grid size-[18px] place-items-center rounded-full bg-coral text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>

      {/* Dropdown: full width on phones, 320px under the bell on bigger screens */}
      {open && (
        <div className="fixed inset-x-4 top-16 z-60 rounded-16 border border-line bg-white shadow-overlay tablet:absolute tablet:inset-x-auto tablet:top-12 tablet:right-0 tablet:w-80">
          <div className="flex items-center justify-between border-b border-line p-3">
            <h3 className="text-sm font-semibold text-brown">Notifications</h3>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs font-semibold text-olive-dark hover:text-olive"
              >
                Mark all read
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted">
              You&apos;re all caught up.
            </p>
          ) : (
            <ul className="p-1.5">
              {items.map((item) => (
                <li
                  key={item.id}
                  className={
                    item.read
                      ? "p-3 rounded-2xl hover:bg-ivory"
                      : " bg-amber-soft/40 p-3 rounded-12 hover:bg-amber-soft/20"
                  }
                >
                  <p className="text-sm font-semibold text-brown">
                    {item.title}
                  </p>
                  <p className="text-sm text-muted">{item.message}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

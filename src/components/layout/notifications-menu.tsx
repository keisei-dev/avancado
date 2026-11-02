// UI library (P2): NotificationsMenu
// TODO: implement. See docs/UI-LIBRARY.md for conventions.
/**
 * Dropdown list: unread (amber-soft background) and read items,
 * "Mark all read", empty state.
 */

export function NotificationsMenu() {
  return (
    <div className="w-80 rounded-12 border border-line bg-white shadow-admin">
      <div className="flex items-center justify-between gap-2 border-b border-line p-3">
        <h3 className="text-sm font-semibold text-brown">Notifications</h3>
        <button
          type="button"
          className="text-xs font-medium text-olive hover:text-olive-dark"
        >
          Mark all read
        </button>
      </div>

      <div className="p-3">
        <p className="text-sm text-muted">No notifications</p>
      </div>
    </div>
  );
}

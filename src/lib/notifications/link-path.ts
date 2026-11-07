import type {
  NotificationTarget,
  NotificationType,
} from "@/types/notification";

// Returns the app path that opens when the notification is tapped.
// All notification URLs live in this one file, so a URL change is a one-line fix.
export function buildLinkPath(
  type: NotificationType,
  target: NotificationTarget,
): string {
  switch (type) {
    case "APPLICATION_RECEIVED":
      return `/sitter-board/my-requests/${requireId(target.requestId, type)}`;

    case "APPLICATION_ACCEPTED":
    case "REQUEST_COMPLETED":
      return `/sitter-board/${requireId(target.requestId, type)}`;

    case "APPLICATION_REJECTED":
      return "/sitter-board/applied";
    case "REQUEST_COMPLETED":
      return `/sitter-board/${requireId(target.requestId, type)}`;

    case "VERIFICATION_APPROVED":
    case "VERIFICATION_REJECTED":
      return "/profile/me";

    case "NEW_MESSAGE":
      return `/messages/${requireId(target.conversationId, type)}`;

    default:
      // If someone adds a new type to the enum but forgets this switch,
      // TypeScript shows an error here. This is called an "exhaustive check".
      return assertNever(type);
  }
}

// Throws a clear error when a caller forgot a required ID.
function requireId(id: string | undefined, type: NotificationType): string {
  if (!id) {
    throw new Error(
      `Notification type ${type} needs an id, but none was given.`,
    );
  }
  return id;
}

function assertNever(value: never): never {
  throw new Error(`Unhandled notification type: ${String(value)}`);
}

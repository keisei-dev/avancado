import type {
  NotificationContext,
  NotificationType,
} from "@/types/notification";

// A fixed title for each type. Record<NotificationType, string> makes TypeScript
// require one entry for every type in the enum.
const TITLES: Record<NotificationType, string> = {
  APPLICATION_RECEIVED: "New applicant",
  APPLICATION_ACCEPTED: "You were chosen as the sitter",
  APPLICATION_REJECTED: "Application not selected",
  REQUEST_COMPLETED: "Sitting completed",
  VERIFICATION_APPROVED: "You are now verified",
  VERIFICATION_REJECTED: "Verification was not approved",
  NEW_MESSAGE: "New message",
};

// The body text can use names. It returns null when a name is missing,
// because the body column is optional in the database.
export function buildContent(
  type: NotificationType,
  context: NotificationContext,
): { title: string; body: string | null } {
  const actor = context.actorName;
  const pet = context.petName;

  const bodies: Record<NotificationType, string | null> = {
    APPLICATION_RECEIVED:
      actor && pet ? `${actor} offered to help with ${pet}.` : null,
    APPLICATION_ACCEPTED:
      actor && pet ? `${actor} confirmed you as ${pet}'s sitter.` : null,
    APPLICATION_REJECTED:
      actor && pet ? `${actor} chose another sitter for ${pet}.` : null,
    REQUEST_COMPLETED:
      actor && pet ? `${actor} marked the sitting for ${pet} as done.` : null,
    VERIFICATION_APPROVED:
      "An admin approved your ID. Your profile now shows the Verified badge.",
    VERIFICATION_REJECTED:
      "An admin could not approve your ID. You can submit it again.",
    NEW_MESSAGE: actor ? `${actor} sent you a message.` : null,
  };

  return { title: TITLES[type], body: bodies[type] };
}

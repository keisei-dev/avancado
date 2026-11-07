# Notifications

How in-app notifications work and how to create one from your feature.
For general setup see [SETUP.md](./SETUP.md). For the database see
[database.md](./database.md).

## 1. Overview

- Notifications are rows in the `Notification` table (one row per recipient).
- The bell in the top bar shows the newest 20 notifications of the logged-in
  user. There is no separate list page.
- Clicking a notification marks it as read and opens its `linkPath`.
- Notifications use plain HTTP. There is no live update: a new notification
  shows up after the next page load or navigation.

## 2. Create a notification

Call `createNotification()` from a Server Action or Route Handler, **after**
the main change has been saved.

```ts
import { createNotification } from "@/lib/notifications/create";

await createNotification({
  userId: ownerId, // who receives it
  type: "APPLICATION_RECEIVED",
  requestId: request.id, // used to build the link
  actorName: applicant.name, // used in the text
  petName: pet.name, // used in the text
});
```

You never write the title, the text, or the URL. They are built from the
type in these files (change them there, not in your feature):

| File                                 | What it decides                     |
| ------------------------------------ | ----------------------------------- |
| `src/lib/notifications/content.ts`   | Title and body text for each type   |
| `src/lib/notifications/link-path.ts` | Which page opens when it is clicked |

### What to pass for each type

| Type                    | Recipient                            | Required id      | Names for the text              |
| ----------------------- | ------------------------------------ | ---------------- | ------------------------------- |
| `APPLICATION_RECEIVED`  | Request owner                        | `requestId`      | `actorName` (sitter), `petName` |
| `APPLICATION_ACCEPTED`  | The chosen sitter                    | `requestId`      | `actorName` (owner), `petName`  |
| `APPLICATION_REJECTED`  | A sitter who was not chosen          | none             | `actorName` (owner), `petName`  |
| `REQUEST_COMPLETED`     | The sitter                           | `requestId`      | `actorName` (owner), `petName`  |
| `VERIFICATION_APPROVED` | The verified user                    | none             | none                            |
| `VERIFICATION_REJECTED` | The user who applied                 | none             | none                            |
| `NEW_MESSAGE`           | The other chat participant           | `conversationId` | `actorName` (sender)            |
| `MATCH_CANCELLED`       | The sitter whose match was cancelled | none             | `actorName` (owner), `petName`  |
| `APPLICATION_WITHDRAWN` | Request owner                        | `requestId`      | `actorName` (sitter), `petName` |

If a required id is missing, `createNotification()` throws an error. If a
name is missing, the notification is still created, just without body text.

### Rules

- Notify the **recipient**, not the person who did the action.
- Call it after the main change succeeded, so nobody gets a notification
  about something that failed.
- Do not build URLs or text in your feature. Use the type and the ids.

## 3. Where each notification should be created

Fill in the owner and the status as features are built.

| Type                    | Create it when...                   | Owner | Connected? |
| ----------------------- | ----------------------------------- | ----- | ---------- |
| `APPLICATION_RECEIVED`  | A sitter applies to a request       | Jamie |            |
| `APPLICATION_ACCEPTED`  | The owner confirms a sitter         | Jamie |            |
| `APPLICATION_REJECTED`  | The owner confirms another sitter   | Jamie |            |
| `REQUEST_COMPLETED`     | The owner marks the request as done | Jamie |            |
| `VERIFICATION_APPROVED` | An admin approves an ID             | Joy   |            |
| `VERIFICATION_REJECTED` | An admin rejects an ID              | Joy   |            |
| `NEW_MESSAGE`           | A chat message is sent              | Mako  |            |
| `MATCH_CANCELLED`       | The owner cancels a match           | Jamie |            |
| `APPLICATION_WITHDRAWN` | A sitter withdraws an application   | Jamie |            |

## 4. Other functions (you usually do not need these)

| Function                            | File                                 | Use                                       |
| ----------------------------------- | ------------------------------------ | ----------------------------------------- |
| `getMyNotifications(userId, limit)` | `src/lib/notifications/queries.ts`   | Newest notifications of one user          |
| `getUnreadCount(userId)`            | `src/lib/notifications/queries.ts`   | Number of unread notifications            |
| `markAsRead(userId, id)`            | `src/lib/notifications/mutations.ts` | Mark one as read (own notifications only) |
| `markAllAsRead(userId)`             | `src/lib/notifications/mutations.ts` | Mark all as read                          |

Server Actions for the UI are in `src/app/notifications/actions.ts`.
All of these are server only.

## 5. Add a new notification type

Tell the database owner first, because this changes the shared database.

1. Add the value to `enum NotificationType` in `prisma/schema.prisma` and
   create a migration (see [database.md](./database.md), section 7).
2. Add a title and a body in `content.ts`.
3. Add a `case` in `link-path.ts`.
4. Add a row to the tables in this file.

If you forget step 2 or 3, `npm run typecheck` fails. That is on purpose.

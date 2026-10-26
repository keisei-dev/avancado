# Folder Ownership

Who owns which part of the codebase, and which Notion flows each part covers.
The owner builds the feature, is the default reviewer for changes to it, and
should be asked before someone else edits it.

Each row covers only the files directly in that folder (its `page.tsx` or
`layout.tsx`), **not** its subfolders. For example, `src/app/admin/` belongs to
Keisei but `src/app/admin/map/` belongs to Eunjeong.

## At a glance

| Owner    | Routes                                                                                                                                                   | Component folders                                             |
| -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Eunjeong | `/sitter-board/new`, `/sitter-board/my-requests`, `/sitter-board/my-requests/:requestId`, `/sitter-board/applied`, `/map`, `/map/:placeId`, `/admin/map` | `sitter-board/` (with Joy), `map/`                            |
| Joy      | `/`, `/sitter-board`, `/sitter-board/:requestId`, `/profile/:userId`, `/profile/me`, `/profile/me/edit`, `/profile/me/verification`                      | `ui/`, `layout/`, `sitter-board/` (with Eunjeong), `profile/` |
| Keisei   | `/admin`, `/admin/users`, `/admin/community`, `/admin/sitter-requests`, `/admin/verification`, `/admin/reports`                                          | `admin/`, `report/`                                           |
| Makoto   | `/my-pets`, `/my-pets/new`, `/my-pets/:petId`, `/my-pets/:petId/logs`, `/messages`, `/messages/:conversationId`, `/notifications`                        | `my-pets/`, `messages/`, `notifications/`                     |
| Togo     | `/login`, `/signup`, `/community`, `/community/new`, `/community/:postId`, `/profile/me/settings`                                                        | `auth/`, `community/`                                         |

## Routes (`src/app/`)

| Folder                                          | URL                                    | Owner    | Notion flows                                                                                       |
| ----------------------------------------------- | -------------------------------------- | -------- | -------------------------------------------------------------------------------------------------- |
| `src/app/` (`page.tsx`)                         | `/`                                    | Joy      | Home: Public home                                                                                  |
| `src/app/(auth)/login/`                         | `/login`                               | Togo     | Login: Authentication                                                                              |
| `src/app/(auth)/signup/`                        | `/signup`                              | Togo     | Login: Authentication                                                                              |
| `src/app/community/`                            | `/community`                           | Togo     | Community feed + Filter lost pet                                                                   |
| `src/app/community/new/`                        | `/community/new`                       | Togo     | Community: Create post                                                                             |
| `src/app/community/[postId]/`                   | `/community/:postId`                   | Togo     | Post detail, React, Report, Mark pet found                                                         |
| `src/app/sitter-board/`                         | `/sitter-board`                        | Joy      | Sitter Board: Browse sitter requests                                                               |
| `src/app/sitter-board/[requestId]/`             | `/sitter-board/:requestId`             | Joy      | Request detail, Apply to help sit a pet                                                            |
| `src/app/sitter-board/new/`                     | `/sitter-board/new`                    | Eunjeong | Sitter Board: Create a sitter request                                                              |
| `src/app/sitter-board/my-requests/`             | `/sitter-board/my-requests`            | Eunjeong | Sitter Board: Manage sitter requests                                                               |
| `src/app/sitter-board/my-requests/[requestId]/` | `/sitter-board/my-requests/:requestId` | Eunjeong | View applicants and confirm sitter, Cancel sitter, Mark sitting done and review, Delete my request |
| `src/app/sitter-board/applied/`                 | `/sitter-board/applied`                | Eunjeong | Applied tab, Withdraw sitter application                                                           |
| `src/app/profile/[userId]/`                     | `/profile/:userId`                     | Joy      | Profile: View public profile                                                                       |
| `src/app/profile/me/`                           | `/profile/me`                          | Joy      | Profile: View my profile                                                                           |
| `src/app/profile/me/edit/`                      | `/profile/me/edit`                     | Joy      | Profile: Edit my profile                                                                           |
| `src/app/profile/me/verification/`              | `/profile/me/verification`             | Joy      | Profile: Request identity verification                                                             |
| `src/app/profile/me/settings/`                  | `/profile/me/settings`                 | Togo     | Profile: Profile settings (email, password)                                                        |
| `src/app/my-pets/`                              | `/my-pets`                             | Makoto   | My Pets: View my pets and health dashboard                                                         |
| `src/app/my-pets/new/`                          | `/my-pets/new`                         | Makoto   | My Pets: Add another pet                                                                           |
| `src/app/my-pets/[petId]/`                      | `/my-pets/:petId`                      | Makoto   | Pet detail and health data log                                                                     |
| `src/app/my-pets/[petId]/logs/`                 | `/my-pets/:petId/logs`                 | Makoto   | My Pets: Add/edit health data log                                                                  |
| `src/app/map/`                                  | `/map`                                 | Eunjeong | Map: Explore map                                                                                   |
| `src/app/map/[placeId]/`                        | `/map/:placeId`                        | Eunjeong | Map: Review place, Report place                                                                    |
| `src/app/messages/`                             | `/messages`                            | Makoto   | Message: Manage messages                                                                           |
| `src/app/messages/[conversationId]/`            | `/messages/:conversationId`            | Makoto   | Message between owner & sitter, Lost/found pet messages                                            |
| `src/app/notifications/`                        | `/notifications`                       | Makoto   | Notifications                                                                                      |
| `src/app/admin/` (`layout.tsx`, `page.tsx`)     | `/admin`                               | Keisei   | Admin: Log in and Dashboard                                                                        |
| `src/app/admin/users/`                          | `/admin/users`                         | Keisei   | Admin: Manage users                                                                                |
| `src/app/admin/community/`                      | `/admin/community`                     | Keisei   | Admin: Community                                                                                   |
| `src/app/admin/sitter-requests/`                | `/admin/sitter-requests`               | Keisei   | Admin: Sitter Request                                                                              |
| `src/app/admin/verification/`                   | `/admin/verification`                  | Keisei   | Admin: Identity verification                                                                       |
| `src/app/admin/reports/`                        | `/admin/reports`                       | Keisei   | Sitter Board: Report (admin side)                                                                  |
| `src/app/admin/map/`                            | `/admin/map`                           | Eunjeong | Admin: Map                                                                                         |

## Components (`src/components/`)

| Folder                          | Owner         | Related Notion flows                                                                                                                                                                                                                                                                                     |
| ------------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/ui/`            | Joy           | UI components & styling, shared by every feature                                                                                                                                                                                                                                                         |
| `src/components/layout/`        | Joy           | UI components & styling (header, footer, navigation)                                                                                                                                                                                                                                                     |
| `src/components/auth/`          | Togo          | Login: Authentication; Profile: Profile settings (email, password)                                                                                                                                                                                                                                       |
| `src/components/community/`     | Togo          | Community feed + Filter lost pet; Community: Create post; Post detail, React, Report, Mark pet found                                                                                                                                                                                                     |
| `src/components/sitter-board/`  | Eunjeong, Joy | Sitter Board: Browse sitter requests; Request detail, Apply to help sit a pet; Sitter Board: Create a sitter request; Sitter Board: Manage sitter requests; View applicants and confirm sitter, Cancel sitter, Mark sitting done and review, Delete my request; Applied tab, Withdraw sitter application |
| `src/components/profile/`       | Joy           | Profile: View public profile; Profile: View my profile; Profile: Edit my profile; Profile: Request identity verification                                                                                                                                                                                 |
| `src/components/my-pets/`       | Makoto        | My Pets: View my pets and health dashboard; My Pets: Add another pet; Pet detail and health data log; My Pets: Add/edit health data log                                                                                                                                                                  |
| `src/components/messages/`      | Makoto        | Message: Manage messages; Message between owner & sitter, Lost/found pet messages                                                                                                                                                                                                                        |
| `src/components/notifications/` | Makoto        | Notifications                                                                                                                                                                                                                                                                                            |
| `src/components/map/`           | Eunjeong      | Map: Explore map; Map: Review place, Report place; Admin: Map                                                                                                                                                                                                                                            |
| `src/components/admin/`         | Keisei        | Admin: Log in and Dashboard; Admin: Manage users; Admin: Community; Admin: Sitter Request; Admin: Identity verification                                                                                                                                                                                  |
| `src/components/report/`        | Keisei        | Sitter Board: Report (admin side); the Report actions in Post detail and Map place pages                                                                                                                                                                                                                 |

## Not listed above

- **Shared code** (`src/lib/`, `src/hooks/`, `src/types/`, `src/proxy.ts`,
  `src/app/layout.tsx`, `src/app/globals.css`, and config files in the repo
  root) is used by everyone. Changes are fine, but mention them clearly in your
  PR because they affect every feature.
- **Database files** (schema, migrations, database client) are owned by the
  database owner, who will add them and document where they live.
